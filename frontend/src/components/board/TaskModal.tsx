import { Component, Show, createSignal, For } from 'solid-js';
import { Task, TaskDetail } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { boardStore } from '../../stores/boardStore';
import { uiStore } from '../../stores/uiStore';
import { api } from '../../services/api';

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TaskModal: Component<TaskModalProps> = (props) => {
    const [isEditing, setIsEditing] = createSignal(false);
    const [editTitle, setEditTitle] = createSignal('');
    const [editDescription, setEditDescription] = createSignal('');
    const [taskDetail, setTaskDetail] = createSignal<TaskDetail | null>(null);
    const [newComment, setNewComment] = createSignal('');
    const [isLoading, setIsLoading] = createSignal(false);

    const loadTaskDetail = async () => {
        if (!props.task) return;

        setIsLoading(true);
        try {
            const detail = await api.getTask(props.task.id) as TaskDetail;
            setTaskDetail(detail);
        } catch (error) {
            console.error('Failed to load task detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!props.task) return;

        try {
            await boardStore.updateTask(props.task.id, {
                title: editTitle(),
                description: editDescription(),
            });
            setIsEditing(false);
            uiStore.showSuccess('Task updated');
        } catch (error) {
            uiStore.showError('Failed to update task');
        }
    };

    const handleDelete = async () => {
        if (!props.task) return;

        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await boardStore.deleteTask(props.task.id);
                props.onClose();
                uiStore.showSuccess('Task deleted');
            } catch (error) {
                uiStore.showError('Failed to delete task');
            }
        }
    };

    const handleAddComment = async () => {
        if (!props.task || !newComment().trim()) return;

        try {
            await api.addComment(props.task.id, newComment());
            setNewComment('');
            loadTaskDetail();
            uiStore.showSuccess('Comment added');
        } catch (error) {
            uiStore.showError('Failed to add comment');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Load details when modal opens
    const handleOpen = () => {
        if (props.task) {
            setEditTitle(props.task.title);
            setEditDescription(props.task.description || '');
            loadTaskDetail();
        }
    };

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={props.task?.taskKey || 'Task'}
            size="lg"
        >
            <Show when={props.task}>
                {(task) => {
                    // Call handleOpen when component mounts with a task
                    handleOpen();

                    return (
                        <div class="space-y-6">
                            {/* Title & Description */}
                            <div>
                                <Show
                                    when={isEditing()}
                                    fallback={
                                        <>
                                            <h3
                                                class="text-lg font-semibold text-surface-900 dark:text-white mb-2 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 px-2 py-1 -mx-2 rounded"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                {task().title}
                                            </h3>
                                            <p
                                                class="text-surface-600 dark:text-surface-300 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 px-2 py-1 -mx-2 rounded min-h-[60px]"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                {task().description || 'Click to add description...'}
                                            </p>
                                        </>
                                    }
                                >
                                    <Input
                                        value={editTitle()}
                                        onInput={(e) => setEditTitle(e.currentTarget.value)}
                                        class="mb-2"
                                    />
                                    <Textarea
                                        value={editDescription()}
                                        onInput={(e) => setEditDescription(e.currentTarget.value)}
                                        placeholder="Add description..."
                                        class="mb-3"
                                    />
                                    <div class="flex gap-2">
                                        <Button size="sm" onClick={handleSave}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </Show>
                            </div>

                            {/* Details Grid */}
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Priority</label>
                                    <div class="mt-1">
                                        <span class={`badge ${task().priority === 'Critical' ? 'badge-priority-critical' :
                                                task().priority === 'High' ? 'badge-priority-high' :
                                                    task().priority === 'Medium' ? 'badge-priority-medium' :
                                                        'badge-priority-low'
                                            }`}>
                                            {task().priority}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Assignee</label>
                                    <div class="mt-1 flex items-center gap-2">
                                        <Show when={task().assignee} fallback={<span class="text-surface-400">Unassigned</span>}>
                                            <Avatar user={task().assignee} size="sm" />
                                            <span class="text-sm text-surface-700 dark:text-surface-300">
                                                {task().assignee?.firstName} {task().assignee?.lastName}
                                            </span>
                                        </Show>
                                    </div>
                                </div>

                                <Show when={task().dueDate}>
                                    <div>
                                        <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Due Date</label>
                                        <p class="mt-1 text-sm text-surface-700 dark:text-surface-300">
                                            {new Date(task().dueDate!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Show>

                                <Show when={task().storyPoints}>
                                    <div>
                                        <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Story Points</label>
                                        <p class="mt-1 text-sm text-surface-700 dark:text-surface-300">{task().storyPoints}</p>
                                    </div>
                                </Show>
                            </div>

                            {/* Labels */}
                            <Show when={task().labels.length > 0}>
                                <div>
                                    <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Labels</label>
                                    <div class="mt-2 flex flex-wrap gap-2">
                                        <For each={task().labels}>
                                            {(label) => (
                                                <span
                                                    class="px-2 py-1 text-xs font-medium rounded"
                                                    style={{ 'background-color': label.color + '20', color: label.color }}
                                                >
                                                    {label.name}
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </div>
                            </Show>

                            {/* Comments */}
                            <div>
                                <label class="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3 block">
                                    Comments
                                </label>

                                {/* New Comment */}
                                <div class="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newComment()}
                                        onInput={(e) => setNewComment(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Add a comment..."
                                        class="input flex-1"
                                    />
                                    <Button size="sm" onClick={handleAddComment}>Send</Button>
                                </div>

                                {/* Comments List */}
                                <div class="space-y-3 max-h-[200px] overflow-y-auto">
                                    <For each={taskDetail()?.comments || []}>
                                        {(comment) => (
                                            <div class="flex gap-3">
                                                <Avatar user={comment.user} size="sm" />
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-sm font-medium text-surface-900 dark:text-white">
                                                            {comment.user.firstName} {comment.user.lastName}
                                                        </span>
                                                        <span class="text-xs text-surface-400">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p class="text-sm text-surface-600 dark:text-surface-300 mt-1">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </div>

                            {/* Activity */}
                            <Show when={taskDetail()?.activityLogs && taskDetail()!.activityLogs.length > 0}>
                                <div>
                                    <label class="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3 block">
                                        Activity
                                    </label>
                                    <div class="space-y-2 max-h-[150px] overflow-y-auto">
                                        <For each={taskDetail()?.activityLogs.slice(0, 10)}>
                                            {(log) => (
                                                <div class="flex items-center gap-2 text-xs text-surface-500">
                                                    <span class="font-medium text-surface-700 dark:text-surface-300">
                                                        {log.user.firstName}
                                                    </span>
                                                    <span>{log.action.toLowerCase()}</span>
                                                    <Show when={log.details}>
                                                        <span class="text-surface-400">- {log.details}</span>
                                                    </Show>
                                                    <span class="ml-auto">{formatDate(log.createdAt)}</span>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                </div>
                            </Show>

                            {/* Actions */}
                            <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                                <Button variant="danger" size="sm" onClick={handleDelete}>
                                    Delete Task
                                </Button>
                            </div>
                        </div>
                    );
                }}
            </Show>
        </Modal>
    );
};
