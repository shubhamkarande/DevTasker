import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { Task, Label, User } from '../../types';
import { Button } from '../ui/Button';

export interface TaskFilters {
    search: string;
    priority: string[];
    assignees: string[];
    labels: string[];
    dueDateRange: { start: string; end: string } | null;
    hasNoAssignee: boolean;
    hasNoDueDate: boolean;
}

interface TaskFilterProps {
    tasks: Task[];
    labels?: Label[];
    members?: User[];
    onFilterChange: (filteredTasks: Task[]) => void;
}

export const TaskFilter: Component<TaskFilterProps> = (props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const [search, setSearch] = createSignal('');
    const [selectedPriorities, setSelectedPriorities] = createSignal<Set<string>>(new Set());
    const [selectedAssignees, setSelectedAssignees] = createSignal<Set<string>>(new Set());
    const [selectedLabels, setSelectedLabels] = createSignal<Set<string>>(new Set());
    const [dueDateStart, setDueDateStart] = createSignal('');
    const [dueDateEnd, setDueDateEnd] = createSignal('');
    const [hasNoAssignee, setHasNoAssignee] = createSignal(false);
    const [hasNoDueDate, setHasNoDueDate] = createSignal(false);

    const priorities = ['Critical', 'High', 'Medium', 'Low'];

    const filteredTasks = createMemo(() => {
        let result = [...props.tasks];

        // Search filter
        if (search()) {
            const query = search().toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.taskKey?.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
            );
        }

        // Priority filter
        if (selectedPriorities().size > 0) {
            result = result.filter(t => selectedPriorities().has(t.priority));
        }

        // Assignee filter
        if (selectedAssignees().size > 0 || hasNoAssignee()) {
            result = result.filter(t => {
                if (hasNoAssignee() && !t.assignee) return true;
                if (t.assignee && selectedAssignees().has(t.assignee.id)) return true;
                return false;
            });
        }

        // Labels filter
        if (selectedLabels().size > 0) {
            result = result.filter(t =>
                t.labels?.some(l => selectedLabels().has(l.id))
            );
        }

        // Due date range filter
        if (dueDateStart() || dueDateEnd()) {
            result = result.filter(t => {
                if (!t.dueDate) return hasNoDueDate();
                const due = new Date(t.dueDate);
                if (dueDateStart() && due < new Date(dueDateStart())) return false;
                if (dueDateEnd() && due > new Date(dueDateEnd())) return false;
                return true;
            });
        }

        // No due date filter
        if (hasNoDueDate() && !dueDateStart() && !dueDateEnd()) {
            result = result.filter(t => !t.dueDate);
        }

        return result;
    });

    // Update parent whenever filters change
    createMemo(() => {
        props.onFilterChange(filteredTasks());
    });

    const activeFilterCount = createMemo(() => {
        let count = 0;
        if (search()) count++;
        if (selectedPriorities().size > 0) count++;
        if (selectedAssignees().size > 0) count++;
        if (selectedLabels().size > 0) count++;
        if (dueDateStart() || dueDateEnd()) count++;
        if (hasNoAssignee()) count++;
        if (hasNoDueDate()) count++;
        return count;
    });

    const clearFilters = () => {
        setSearch('');
        setSelectedPriorities(new Set<string>());
        setSelectedAssignees(new Set<string>());
        setSelectedLabels(new Set<string>());
        setDueDateStart('');
        setDueDateEnd('');
        setHasNoAssignee(false);
        setHasNoDueDate(false);
    };

    const togglePriority = (priority: string) => {
        setSelectedPriorities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(priority)) {
                newSet.delete(priority);
            } else {
                newSet.add(priority);
            }
            return newSet;
        });
    };

    const toggleAssignee = (assigneeId: string) => {
        setSelectedAssignees(prev => {
            const newSet = new Set(prev);
            if (newSet.has(assigneeId)) {
                newSet.delete(assigneeId);
            } else {
                newSet.add(assigneeId);
            }
            return newSet;
        });
    };

    const toggleLabel = (labelId: string) => {
        setSelectedLabels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(labelId)) {
                newSet.delete(labelId);
            } else {
                newSet.add(labelId);
            }
            return newSet;
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
        }
    };

    return (
        <div class="relative">
            {/* Filter Toggle Button */}
            <div class="flex items-center gap-2">
                {/* Search Input */}
                <div class="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        value={search()}
                        onInput={(e) => setSearch(e.currentTarget.value)}
                        placeholder="Search tasks..."
                        class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filters Button */}
                <button
                    onClick={() => setIsOpen(!isOpen())}
                    class={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${isOpen() || activeFilterCount() > 0
                        ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                        : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-300'
                        }`}
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    <Show when={activeFilterCount() > 0}>
                        <span class="w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary-600 text-white rounded-full">
                            {activeFilterCount()}
                        </span>
                    </Show>
                </button>

                <Show when={activeFilterCount() > 0}>
                    <button
                        onClick={clearFilters}
                        class="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                    >
                        Clear all
                    </button>
                </Show>
            </div>

            {/* Filter Panel */}
            <Show when={isOpen()}>
                <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 p-4 z-50 animate-slide-down">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Priority */}
                        <div>
                            <h4 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Priority</h4>
                            <div class="flex flex-wrap gap-2">
                                <For each={priorities}>
                                    {(priority) => (
                                        <button
                                            onClick={() => togglePriority(priority)}
                                            class={`badge cursor-pointer transition-all ${selectedPriorities().has(priority)
                                                ? getPriorityColor(priority) + ' ring-2 ring-offset-1 ring-primary-500'
                                                : getPriorityColor(priority) + ' opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            {priority}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Assignees */}
                        <Show when={props.members && props.members.length > 0}>
                            <div>
                                <h4 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Assignee</h4>
                                <div class="space-y-1 max-h-32 overflow-y-auto">
                                    <label class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasNoAssignee()}
                                            onChange={() => setHasNoAssignee(!hasNoAssignee())}
                                            class="w-4 h-4 text-primary-600 rounded"
                                        />
                                        Unassigned
                                    </label>
                                    <For each={props.members}>
                                        {(member) => (
                                            <label class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssignees().has(member.id)}
                                                    onChange={() => toggleAssignee(member.id)}
                                                    class="w-4 h-4 text-primary-600 rounded"
                                                />
                                                {member.firstName} {member.lastName}
                                            </label>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Show>

                        {/* Labels */}
                        <Show when={props.labels && props.labels.length > 0}>
                            <div>
                                <h4 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Labels</h4>
                                <div class="flex flex-wrap gap-2">
                                    <For each={props.labels}>
                                        {(label) => (
                                            <button
                                                onClick={() => toggleLabel(label.id)}
                                                class={`px-2 py-1 text-xs rounded transition-all ${selectedLabels().has(label.id)
                                                    ? 'ring-2 ring-offset-1 ring-primary-500'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                style={{ 'background-color': label.color + '30', color: label.color }}
                                            >
                                                {label.name}
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Show>
                    </div>

                    {/* Due Date Range */}
                    <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                        <h4 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Due Date</h4>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <label class="text-sm text-surface-500">From</label>
                                <input
                                    type="date"
                                    value={dueDateStart()}
                                    onInput={(e) => setDueDateStart(e.currentTarget.value)}
                                    class="input py-1 text-sm"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="text-sm text-surface-500">To</label>
                                <input
                                    type="date"
                                    value={dueDateEnd()}
                                    onInput={(e) => setDueDateEnd(e.currentTarget.value)}
                                    class="input py-1 text-sm"
                                />
                            </div>
                            <label class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasNoDueDate()}
                                    onChange={() => setHasNoDueDate(!hasNoDueDate())}
                                    class="w-4 h-4 text-primary-600 rounded"
                                />
                                No due date
                            </label>
                        </div>
                    </div>

                    {/* Results count */}
                    <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
                        <span class="text-sm text-surface-500">
                            Showing {filteredTasks().length} of {props.tasks.length} tasks
                        </span>
                        <Button size="sm" variant="primary" onClick={() => setIsOpen(false)}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </Show>
        </div>
    );
};
