import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { Task } from '../../types';

interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    goal?: string;
    tasks: Task[];
}

interface SprintPlanningProps {
    projectId: string;
    tasks: Task[];
    onCreateSprint?: (sprint: Omit<Sprint, 'id' | 'tasks'>) => void;
}

export const SprintPlanning: Component<SprintPlanningProps> = (props) => {
    const [isCreating, setIsCreating] = createSignal(false);
    const [sprintName, setSprintName] = createSignal('');
    const [startDate, setStartDate] = createSignal('');
    const [endDate, setEndDate] = createSignal('');
    const [sprintGoal, setSprintGoal] = createSignal('');
    const [selectedTasks, setSelectedTasks] = createSignal<Set<string>>(new Set());

    // Mock sprints for demo
    const [sprints, setSprints] = createSignal<Sprint[]>([
        {
            id: '1',
            name: 'Sprint 1',
            startDate: '2024-01-01',
            endDate: '2024-01-14',
            goal: 'Complete user authentication and basic dashboard',
            tasks: [],
        },
    ]);

    const backlogTasks = createMemo(() =>
        props.tasks.filter(t => !sprints().some(s => s.tasks.some(st => st.id === t.id)))
    );

    const totalStoryPoints = (tasks: Task[]) =>
        tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const handleCreateSprint = () => {
        if (!sprintName() || !startDate() || !endDate()) return;

        const newSprint: Sprint = {
            id: Date.now().toString(),
            name: sprintName(),
            startDate: startDate(),
            endDate: endDate(),
            goal: sprintGoal(),
            tasks: props.tasks.filter(t => selectedTasks().has(t.id)),
        };

        setSprints(prev => [...prev, newSprint]);
        setIsCreating(false);
        setSprintName('');
        setStartDate('');
        setEndDate('');
        setSprintGoal('');
        setSelectedTasks(new Set<string>());
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const getSprintProgress = (sprint: Sprint) => {
        if (sprint.tasks.length === 0) return 0;
        const doneTasks = sprint.tasks.filter(t => (t as any).status === 'Done').length;
        return Math.round((doneTasks / sprint.tasks.length) * 100);
    };

    const getSprintStatus = (sprint: Sprint) => {
        const now = new Date();
        const start = new Date(sprint.startDate);
        const end = new Date(sprint.endDate);

        if (now < start) return { label: 'Upcoming', class: 'bg-blue-100 text-blue-800' };
        if (now > end) return { label: 'Completed', class: 'bg-green-100 text-green-800' };
        return { label: 'Active', class: 'bg-yellow-100 text-yellow-800' };
    };

    return (
        <div class="space-y-6">
            {/* Header */}
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xl font-semibold text-surface-900 dark:text-white">Sprint Planning</h2>
                    <p class="text-surface-500 mt-1">Plan and manage your project sprints</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    class="btn btn-primary"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Sprint
                </button>
            </div>

            {/* Sprint List */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <For each={sprints()}>
                    {(sprint) => {
                        const status = getSprintStatus(sprint);
                        return (
                            <div class="card p-5">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <h3 class="font-semibold text-surface-900 dark:text-white">{sprint.name}</h3>
                                            <span class={`badge ${status.class}`}>{status.label}</span>
                                        </div>
                                        <p class="text-sm text-surface-500">
                                            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-2xl font-bold text-primary-600">{totalStoryPoints(sprint.tasks)}</p>
                                        <p class="text-xs text-surface-500">Story Points</p>
                                    </div>
                                </div>

                                <Show when={sprint.goal}>
                                    <p class="text-sm text-surface-600 dark:text-surface-300 mb-4 italic">
                                        "{sprint.goal}"
                                    </p>
                                </Show>

                                {/* Progress Bar */}
                                <div class="mb-4">
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-surface-500">Progress</span>
                                        <span class="font-medium text-surface-900 dark:text-white">{getSprintProgress(sprint)}%</span>
                                    </div>
                                    <div class="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                        <div
                                            class="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                                            style={{ width: `${getSprintProgress(sprint)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Task Count */}
                                <div class="flex items-center justify-between text-sm text-surface-500 pt-3 border-t border-surface-100 dark:border-surface-700">
                                    <span>{sprint.tasks.length} tasks</span>
                                    <button class="text-primary-600 hover:text-primary-700 font-medium">
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                </For>
            </div>

            {/* Backlog */}
            <div class="card">
                <div class="p-4 border-b border-surface-100 dark:border-surface-700">
                    <h3 class="font-semibold text-surface-900 dark:text-white">Backlog</h3>
                    <p class="text-sm text-surface-500">{backlogTasks().length} unassigned tasks • {totalStoryPoints(backlogTasks())} points</p>
                </div>
                <div class="p-4 max-h-64 overflow-y-auto">
                    <Show
                        when={backlogTasks().length > 0}
                        fallback={<p class="text-surface-500 text-center py-4">No backlog tasks</p>}
                    >
                        <div class="space-y-2">
                            <For each={backlogTasks()}>
                                {(task) => (
                                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50">
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks().has(task.id)}
                                            onChange={() => toggleTaskSelection(task.id)}
                                            class="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <span class="text-xs font-medium text-surface-400">{task.taskKey}</span>
                                        <span class="flex-1 text-sm text-surface-700 dark:text-surface-200">{task.title}</span>
                                        <Show when={task.storyPoints}>
                                            <span class="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                                                {task.storyPoints} pts
                                            </span>
                                        </Show>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>

            {/* Create Sprint Modal */}
            <Show when={isCreating()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-black/50" onClick={() => setIsCreating(false)} />
                    <div class="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-white mb-4">Create New Sprint</h3>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sprint Name</label>
                                <input
                                    type="text"
                                    value={sprintName()}
                                    onInput={(e) => setSprintName(e.currentTarget.value)}
                                    placeholder="Sprint 2"
                                    class="input"
                                />
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate()}
                                        onInput={(e) => setStartDate(e.currentTarget.value)}
                                        class="input"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate()}
                                        onInput={(e) => setEndDate(e.currentTarget.value)}
                                        class="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sprint Goal (optional)</label>
                                <textarea
                                    value={sprintGoal()}
                                    onInput={(e) => setSprintGoal(e.currentTarget.value)}
                                    placeholder="What do you want to achieve in this sprint?"
                                    class="input min-h-[80px]"
                                />
                            </div>

                            <Show when={selectedTasks().size > 0}>
                                <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <p class="text-sm text-primary-700 dark:text-primary-300">
                                        {selectedTasks().size} tasks selected from backlog
                                    </p>
                                </div>
                            </Show>
                        </div>

                        <div class="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsCreating(false)} class="btn btn-secondary">Cancel</button>
                            <button onClick={handleCreateSprint} class="btn btn-primary">Create Sprint</button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
};
