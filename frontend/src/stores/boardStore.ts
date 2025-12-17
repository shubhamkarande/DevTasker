import { createSignal, createRoot } from 'solid-js';
import { Board, Column, Task, TaskMovedEvent, UserPresence } from '../types';
import { api } from '../services/api';
import { signalRService } from '../services/signalr';

function createBoardStore() {
    const [board, setBoard] = createSignal<Board | null>(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [onlineUsers, setOnlineUsers] = createSignal<UserPresence[]>([]);
    const [selectedTask, setSelectedTask] = createSignal<Task | null>(null);

    const loadBoard = async (boardId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const boardData = await api.getBoard(boardId) as Board;
            setBoard(boardData);

            // Connect to SignalR and join board
            await signalRService.connect();
            await signalRService.joinBoard(boardId);

            // Set up real-time handlers
            setupRealtimeHandlers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load board');
        } finally {
            setIsLoading(false);
        }
    };

    const setupRealtimeHandlers = () => {
        signalRService.onTaskMoved(handleTaskMoved);
        signalRService.onTaskCreated(handleTaskCreated);
        signalRService.onTaskUpdated(handleTaskUpdated);
        signalRService.onTaskDeleted(handleTaskDeleted);
        signalRService.onColumnCreated(handleColumnCreated);
        signalRService.onColumnUpdated(handleColumnUpdated);
        signalRService.onColumnsReordered(handleColumnsReordered);
        signalRService.onColumnDeleted(handleColumnDeleted);
        signalRService.onUserJoined(handleUserJoined);
        signalRService.onUserLeft(handleUserLeft);
        signalRService.onCurrentUsers(handleCurrentUsers);
    };

    const handleTaskMoved = (event: TaskMovedEvent) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.map(col => {
            // Remove task from source column
            if (col.id === event.sourceColumnId) {
                return {
                    ...col,
                    tasks: col.tasks.filter(t => t.id !== event.taskId)
                };
            }
            // Add task to target column at new index
            if (col.id === event.targetColumnId) {
                const sourceCol = currentBoard.columns.find(c => c.id === event.sourceColumnId);
                const task = sourceCol?.tasks.find(t => t.id === event.taskId);
                if (task) {
                    const newTasks = [...col.tasks];
                    newTasks.splice(event.newOrderIndex, 0, { ...task, orderIndex: event.newOrderIndex });
                    return { ...col, tasks: newTasks };
                }
            }
            return col;
        });

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleTaskCreated = (task: Task) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.map(col => {
            // Find the column this task belongs to
            const columnId = (task as any).columnId;
            if (columnId && col.id === columnId) {
                return { ...col, tasks: [...col.tasks, task] };
            }
            return col;
        });

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleTaskUpdated = (task: Task) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.map(t => t.id === task.id ? task : t)
        }));

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleTaskDeleted = (taskId: string) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => t.id !== taskId)
        }));

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleColumnCreated = (column: Column) => {
        const currentBoard = board();
        if (!currentBoard) return;

        setBoard({
            ...currentBoard,
            columns: [...currentBoard.columns, column]
        });
    };

    const handleColumnUpdated = (column: Column) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.map(col =>
            col.id === column.id ? { ...col, ...column } : col
        );

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleColumnsReordered = (columnIds: string[]) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = columnIds
            .map((id, index) => {
                const col = currentBoard.columns.find(c => c.id === id);
                return col ? { ...col, orderIndex: index } : null;
            })
            .filter((col): col is Column => col !== null);

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleColumnDeleted = (columnId: string) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumns = currentBoard.columns.filter(col => col.id !== columnId);
        setBoard({ ...currentBoard, columns: newColumns });
    };

    const handleUserJoined = (presence: UserPresence) => {
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== presence.userId), presence]);
    };

    const handleUserLeft = (userId: string) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleCurrentUsers = (users: UserPresence[]) => {
        setOnlineUsers(users);
    };

    // Actions
    const createTask = async (columnId: string, title: string, description?: string) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newTask = await api.createTask({
            columnId,
            title,
            description,
            priority: 'Medium'
        }) as Task;

        // Update local state
        const newColumns = currentBoard.columns.map(col =>
            col.id === columnId
                ? { ...col, tasks: [...col.tasks, newTask] }
                : col
        );

        setBoard({ ...currentBoard, columns: newColumns });
        return newTask;
    };

    const moveTask = async (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => {
        const currentBoard = board();
        if (!currentBoard) return;

        // Optimistic update
        const sourceCol = currentBoard.columns.find(c => c.id === sourceColumnId);
        const task = sourceCol?.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newColumns = currentBoard.columns.map(col => {
            if (col.id === sourceColumnId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            if (col.id === targetColumnId) {
                const newTasks = col.tasks.filter(t => t.id !== taskId);
                newTasks.splice(newIndex, 0, { ...task, orderIndex: newIndex });
                return { ...col, tasks: newTasks };
            }
            return col;
        });

        setBoard({ ...currentBoard, columns: newColumns });

        try {
            await api.moveTask(taskId, { columnId: targetColumnId, orderIndex: newIndex });
        } catch (error) {
            // Revert on error
            setBoard(currentBoard);
            throw error;
        }
    };

    const updateTask = async (taskId: string, data: Partial<Task>) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const updatedTask = await api.updateTask(taskId, data) as Task;

        const newColumns = currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.map(t => t.id === taskId ? updatedTask : t)
        }));

        setBoard({ ...currentBoard, columns: newColumns });
        return updatedTask;
    };

    const deleteTask = async (taskId: string) => {
        const currentBoard = board();
        if (!currentBoard) return;

        await api.deleteTask(taskId);

        const newColumns = currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => t.id !== taskId)
        }));

        setBoard({ ...currentBoard, columns: newColumns });
    };

    const createColumn = async (name: string, color?: string) => {
        const currentBoard = board();
        if (!currentBoard) return;

        const newColumn = await api.createColumn(currentBoard.id, { name, color }) as Column;
        setBoard({ ...currentBoard, columns: [...currentBoard.columns, newColumn] });
        return newColumn;
    };

    const cleanup = async () => {
        signalRService.clearHandlers();
        await signalRService.disconnect();
        setBoard(null);
        setOnlineUsers([]);
    };

    return {
        board,
        isLoading,
        error,
        onlineUsers,
        selectedTask,
        setSelectedTask,
        loadBoard,
        createTask,
        moveTask,
        updateTask,
        deleteTask,
        createColumn,
        cleanup,
    };
}

export const boardStore = createRoot(createBoardStore);
