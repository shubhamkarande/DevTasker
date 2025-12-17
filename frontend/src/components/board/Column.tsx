import { Component, For, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { Column as ColumnType, Task } from '../../types';
import { TaskCard } from './TaskCard';
import { boardStore } from '../../stores/boardStore';
import { Button } from '../ui/Button';
import { uiStore } from '../../stores/uiStore';

interface ColumnProps {
    column: ColumnType;
    onTaskDrop: (taskId: string, targetColumnId: string, targetIndex: number) => void;
}

export const Column: Component<ColumnProps> = (props) => {
    const [isAddingTask, setIsAddingTask] = createSignal(false);
    const [newTaskTitle, setNewTaskTitle] = createSignal('');
    const [isDragOver, setIsDragOver] = createSignal(false);
    const [dropIndex, setDropIndex] = createSignal<number | null>(null);

    const sortedTasks = () => [...props.column.tasks].sort((a, b) => a.orderIndex - b.orderIndex);

    const handleAddTask = async () => {
        const title = newTaskTitle().trim();
        if (!title) return;

        try {
            await boardStore.createTask(props.column.id, title);
            setNewTaskTitle('');
            setIsAddingTask(false);
            uiStore.showSuccess('Task created');
        } catch (error) {
            uiStore.showError('Failed to create task');
        }
    };

    // Drag and Drop handlers
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        setIsDragOver(true);

        // Calculate drop index based on mouse position
        const column = e.currentTarget as HTMLElement;
        const taskElements = column.querySelectorAll('[data-task-id]');
        const mouseY = e.clientY;

        let newDropIndex = sortedTasks().length;

        taskElements.forEach((taskEl, index) => {
            const rect = taskEl.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (mouseY < midY && newDropIndex === sortedTasks().length) {
                newDropIndex = index;
            }
        });

        setDropIndex(newDropIndex);
    };

    const handleDragLeave = (e: DragEvent) => {
        // Only set drag over to false if we're actually leaving the column
        const relatedTarget = e.relatedTarget as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        if (!currentTarget.contains(relatedTarget)) {
            setIsDragOver(false);
            setDropIndex(null);
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const taskId = e.dataTransfer?.getData('text/plain');
        const targetIndex = dropIndex() ?? sortedTasks().length;
        setDropIndex(null);

        if (taskId) {
            props.onTaskDrop(taskId, props.column.id, targetIndex);
        }
    };

    return (
        <div class="kanban-column">
            {/* Column Header */}
            <div class="kanban-column-header">
                <div class="flex items-center gap-2">
                    <div
                        class="w-3 h-3 rounded-full"
                        style={{ 'background-color': props.column.color || '#6366f1' }}
                    />
                    <h3 class="font-medium text-surface-900 dark:text-white">{props.column.name}</h3>
                    <span class="text-sm text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded-full">
                        {props.column.tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => setIsAddingTask(true)}
                    class="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Column Content - Drop Zone */}
            <div
                class={`kanban-column-content transition-colors ${isDragOver() ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Add Task Form */}
                <Show when={isAddingTask()}>
                    <div class="bg-white dark:bg-surface-800 rounded-lg p-3 shadow-sm border border-surface-200 dark:border-surface-700 mb-2">
                        <input
                            type="text"
                            value={newTaskTitle()}
                            onInput={(e) => setNewTaskTitle(e.currentTarget.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTask();
                                if (e.key === 'Escape') {
                                    setIsAddingTask(false);
                                    setNewTaskTitle('');
                                }
                            }}
                            placeholder="Enter task title..."
                            class="w-full px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-surface-900 dark:text-white placeholder-surface-400"
                            autofocus
                        />
                        <div class="flex items-center gap-2 mt-2">
                            <Button size="sm" onClick={handleAddTask}>
                                Add
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsAddingTask(false);
                                    setNewTaskTitle('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Show>

                {/* Tasks */}
                <For each={sortedTasks()}>
                    {(task, index) => (
                        <>
                            {/* Drop indicator before task */}
                            <Show when={isDragOver() && dropIndex() === index()}>
                                <div class="h-1 bg-primary-500 rounded-full my-1 animate-pulse" />
                            </Show>
                            <TaskCard
                                task={task}
                                onClick={() => boardStore.setSelectedTask(task)}
                            />
                        </>
                    )}
                </For>

                {/* Drop indicator at end */}
                <Show when={isDragOver() && dropIndex() === sortedTasks().length}>
                    <div class="h-1 bg-primary-500 rounded-full my-1 animate-pulse" />
                </Show>

                {/* Empty state */}
                <Show when={!isAddingTask() && sortedTasks().length === 0}>
                    <div class="flex flex-col items-center justify-center py-8 text-surface-400">
                        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p class="text-sm">No tasks</p>
                    </div>
                </Show>
            </div>
        </div>
    );
};
