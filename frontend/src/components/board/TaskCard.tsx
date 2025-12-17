import { Component, Show, createSignal } from 'solid-js';
import { Task } from '../../types';
import { Avatar } from '../ui/Avatar';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

export const TaskCard: Component<TaskCardProps> = (props) => {
    const [isDragging, setIsDragging] = createSignal(false);

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'badge-priority-critical';
            case 'High': return 'badge-priority-high';
            case 'Medium': return 'badge-priority-medium';
            case 'Low': return 'badge-priority-low';
            default: return 'bg-surface-100 text-surface-600';
        }
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { text: 'Overdue', class: 'text-red-500' };
        if (days === 0) return { text: 'Today', class: 'text-orange-500' };
        if (days === 1) return { text: 'Tomorrow', class: 'text-yellow-500' };
        if (days <= 7) return { text: `${days}d`, class: 'text-surface-500' };
        return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), class: 'text-surface-500' };
    };

    // Drag handlers
    const handleDragStart = (e: DragEvent) => {
        setIsDragging(true);
        e.dataTransfer!.setData('text/plain', props.task.id);
        e.dataTransfer!.effectAllowed = 'move';

        // Create a custom drag image
        const dragImage = e.currentTarget as HTMLElement;
        e.dataTransfer!.setDragImage(dragImage, 20, 20);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            class={`task-card ${isDragging() ? 'task-card-dragging opacity-50' : ''}`}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={props.onClick}
            data-task-id={props.task.id}
        >
            {/* Labels */}
            <Show when={props.task.labels && props.task.labels.length > 0}>
                <div class="flex flex-wrap gap-1 mb-2">
                    {props.task.labels!.slice(0, 3).map((label) => (
                        <span
                            class="h-1.5 w-8 rounded-full"
                            style={{ 'background-color': label.color }}
                            title={label.name}
                        />
                    ))}
                    <Show when={(props.task.labels?.length || 0) > 3}>
                        <span class="text-xs text-surface-400">+{(props.task.labels?.length || 0) - 3}</span>
                    </Show>
                </div>
            </Show>

            {/* Task Key & Priority */}
            <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-surface-400">{props.task.taskKey}</span>
                <span class={`badge text-[10px] ${getPriorityClass(props.task.priority)}`}>
                    {props.task.priority}
                </span>
            </div>

            {/* Title */}
            <h4 class="text-sm font-medium text-surface-900 dark:text-white mb-2 line-clamp-2">
                {props.task.title}
            </h4>

            {/* Footer */}
            <div class="flex items-center justify-between mt-auto pt-2 border-t border-surface-100 dark:border-surface-700">
                <div class="flex items-center gap-3">
                    {/* Due Date */}
                    <Show when={props.task.dueDate}>
                        {(() => {
                            const due = formatDueDate(props.task.dueDate!);
                            return (
                                <div class={`flex items-center gap-1 text-xs ${due.class}`}>
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {due.text}
                                </div>
                            );
                        })()}
                    </Show>

                    {/* Story Points */}
                    <Show when={props.task.storyPoints}>
                        <div class="flex items-center gap-1 text-xs text-surface-500">
                            <span class="w-4 h-4 rounded bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-[10px] font-bold">
                                {props.task.storyPoints}
                            </span>
                        </div>
                    </Show>

                    {/* Comments Count */}
                    <Show when={props.task.commentsCount && props.task.commentsCount > 0}>
                        <div class="flex items-center gap-1 text-xs text-surface-400">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {props.task.commentsCount}
                        </div>
                    </Show>
                </div>

                {/* Assignee */}
                <Show when={props.task.assignee}>
                    <Avatar user={props.task.assignee!} size="sm" />
                </Show>
            </div>
        </div>
    );
};
