import { Component, For, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { boardStore } from '../../stores/boardStore';
import { uiStore } from '../../stores/uiStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface KanbanBoardProps {
    boardId: string;
}

export const KanbanBoard: Component<KanbanBoardProps> = (props) => {
    const [isAddingColumn, setIsAddingColumn] = createSignal(false);
    const [newColumnName, setNewColumnName] = createSignal('');

    onMount(async () => {
        await boardStore.loadBoard(props.boardId);
    });

    onCleanup(() => {
        boardStore.cleanup();
    });

    const handleTaskDrop = async (taskId: string, targetColumnId: string, targetIndex: number) => {
        const board = boardStore.board();
        if (!board) return;

        // Find source column
        let sourceColumnId = '';
        for (const col of board.columns) {
            if (col.tasks.find(t => t.id === taskId)) {
                sourceColumnId = col.id;
                break;
            }
        }

        if (!sourceColumnId) return;

        try {
            await boardStore.moveTask(taskId, sourceColumnId, targetColumnId, targetIndex);
        } catch (error) {
            uiStore.showError('Failed to move task');
        }
    };

    const handleAddColumn = async () => {
        const name = newColumnName().trim();
        if (!name) return;

        try {
            await boardStore.createColumn(name);
            setNewColumnName('');
            setIsAddingColumn(false);
            uiStore.showSuccess('Column created');
        } catch (error) {
            uiStore.showError('Failed to create column');
        }
    };

    return (
        <div class="h-[calc(100vh-8rem)]">
            {/* Loading */}
            <Show when={boardStore.isLoading()}>
                <div class="flex items-center justify-center h-full">
                    <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            </Show>

            {/* Error */}
            <Show when={boardStore.error()}>
                <div class="flex flex-col items-center justify-center h-full">
                    <p class="text-red-500 mb-4">{boardStore.error()}</p>
                    <Button onClick={() => boardStore.loadBoard(props.boardId)}>
                        Retry
                    </Button>
                </div>
            </Show>

            {/* Board */}
            <Show when={boardStore.board() && !boardStore.isLoading()}>
                {/* Board Header */}
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-xl font-semibold text-surface-900 dark:text-white">
                            {boardStore.board()?.name}
                        </h2>
                        <p class="text-sm text-surface-500">
                            {boardStore.board()?.projectName} • {boardStore.board()?.projectKey}
                        </p>
                    </div>

                    {/* Online Users */}
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-surface-500">
                            {boardStore.onlineUsers().length} online
                        </span>
                        <div class="flex -space-x-2">
                            <For each={boardStore.onlineUsers().slice(0, 5)}>
                                {(presence) => (
                                    <div
                                        class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-surface-800"
                                        title={presence.userName}
                                    >
                                        {presence.userName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </For>
                            <Show when={boardStore.onlineUsers().length > 5}>
                                <div class="w-8 h-8 rounded-full bg-surface-300 dark:bg-surface-600 flex items-center justify-center text-xs font-medium text-surface-600 dark:text-surface-300 border-2 border-white dark:border-surface-800">
                                    +{boardStore.onlineUsers().length - 5}
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>

                {/* Columns */}
                <div class="flex gap-4 overflow-x-auto pb-4 h-[calc(100%-4rem)]">
                    <For each={boardStore.board()?.columns.sort((a, b) => a.orderIndex - b.orderIndex)}>
                        {(column) => (
                            <Column column={column} onTaskDrop={handleTaskDrop} />
                        )}
                    </For>

                    {/* Add Column */}
                    <div class="min-w-[300px]">
                        <Show
                            when={isAddingColumn()}
                            fallback={
                                <button
                                    onClick={() => setIsAddingColumn(true)}
                                    class="w-full h-12 bg-surface-100/50 dark:bg-surface-800/50 hover:bg-surface-200/50 dark:hover:bg-surface-700/50 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 text-surface-500 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Column
                                </button>
                            }
                        >
                            <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-sm border border-surface-200 dark:border-surface-700">
                                <input
                                    type="text"
                                    value={newColumnName()}
                                    onInput={(e) => setNewColumnName(e.currentTarget.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddColumn();
                                        if (e.key === 'Escape') {
                                            setIsAddingColumn(false);
                                            setNewColumnName('');
                                        }
                                    }}
                                    placeholder="Column name..."
                                    class="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    autofocus
                                />
                                <div class="flex items-center gap-2 mt-3">
                                    <Button size="sm" onClick={handleAddColumn}>
                                        Add Column
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => {
                                        setIsAddingColumn(false);
                                        setNewColumnName('');
                                    }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Show>
                    </div>
                </div>
            </Show>

            {/* Task Modal */}
            <TaskModal
                task={boardStore.selectedTask()}
                isOpen={!!boardStore.selectedTask()}
                onClose={() => boardStore.setSelectedTask(null)}
            />
        </div>
    );
};
