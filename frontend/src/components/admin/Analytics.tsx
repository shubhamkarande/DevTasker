import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { Project } from '../../types';
import { api } from '../../services/api';

interface AnalyticsData {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    activeProjects: number;
    tasksByPriority: { priority: string; count: number }[];
    tasksByStatus: { status: string; count: number }[];
    recentActivity: { date: string; count: number }[];
}

export const Analytics: Component = () => {
    const [isLoading, setIsLoading] = createSignal(true);
    const [projects, setProjects] = createSignal<Project[]>([]);

    // Mock analytics data (in real app, this would come from API)
    const [analytics, setAnalytics] = createSignal<AnalyticsData>({
        totalUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        activeProjects: 0,
        tasksByPriority: [
            { priority: 'Critical', count: 5 },
            { priority: 'High', count: 12 },
            { priority: 'Medium', count: 28 },
            { priority: 'Low', count: 15 },
        ],
        tasksByStatus: [
            { status: 'Backlog', count: 20 },
            { status: 'Todo', count: 15 },
            { status: 'In Progress', count: 18 },
            { status: 'Review', count: 8 },
            { status: 'Done', count: 45 },
        ],
        recentActivity: [
            { date: 'Mon', count: 12 },
            { date: 'Tue', count: 19 },
            { date: 'Wed', count: 15 },
            { date: 'Thu', count: 22 },
            { date: 'Fri', count: 18 },
            { date: 'Sat', count: 8 },
            { date: 'Sun', count: 5 },
        ],
    });

    onMount(async () => {
        try {
            const projectsData = await api.getProjects() as Project[];
            setProjects(projectsData);

            // Calculate some real stats
            const totalProjects = projectsData.length;
            const totalTasks = projectsData.reduce((acc, p) => acc + (p.boardCount || 0) * 5, 0); // Estimate

            setAnalytics(prev => ({
                ...prev,
                totalProjects,
                totalTasks,
                activeProjects: totalProjects,
            }));
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    });

    const stats = [
        { label: 'Total Users', value: analytics().totalUsers || 1, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-blue-500 to-blue-600' },
        { label: 'Total Projects', value: analytics().totalProjects, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'from-purple-500 to-purple-600' },
        { label: 'Active Tasks', value: analytics().totalTasks, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'from-green-500 to-green-600' },
        { label: 'Completion Rate', value: '76%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'from-amber-500 to-amber-600' },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-500';
            case 'High': return 'bg-orange-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-green-500';
            case 'In Progress': return 'bg-blue-500';
            case 'Review': return 'bg-purple-500';
            case 'Todo': return 'bg-yellow-500';
            case 'Backlog': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const maxActivityCount = Math.max(...analytics().recentActivity.map(a => a.count));

    return (
        <div>
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-surface-900 dark:text-white">Analytics Dashboard</h2>
                <p class="text-surface-500 mt-1">Overview of project and team performance</p>
            </div>

            <Show
                when={!isLoading()}
                fallback={
                    <div class="flex justify-center py-12">
                        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                }
            >
                {/* Stats Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <For each={stats}>
                        {(stat) => (
                            <div class="card p-5">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-surface-500">{stat.label}</p>
                                        <p class="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div class={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon} />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </For>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Tasks by Priority */}
                    <div class="card p-6">
                        <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Tasks by Priority</h3>
                        <div class="space-y-3">
                            <For each={analytics().tasksByPriority}>
                                {(item) => {
                                    const total = analytics().tasksByPriority.reduce((a, b) => a + b.count, 0);
                                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                                    return (
                                        <div>
                                            <div class="flex justify-between text-sm mb-1">
                                                <span class="text-surface-600 dark:text-surface-300">{item.priority}</span>
                                                <span class="font-medium text-surface-900 dark:text-white">{item.count}</span>
                                            </div>
                                            <div class="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                                <div
                                                    class={`h-full ${getPriorityColor(item.priority)} rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    </div>

                    {/* Tasks by Status */}
                    <div class="card p-6">
                        <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Tasks by Status</h3>
                        <div class="space-y-3">
                            <For each={analytics().tasksByStatus}>
                                {(item) => {
                                    const total = analytics().tasksByStatus.reduce((a, b) => a + b.count, 0);
                                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                                    return (
                                        <div>
                                            <div class="flex justify-between text-sm mb-1">
                                                <span class="text-surface-600 dark:text-surface-300">{item.status}</span>
                                                <span class="font-medium text-surface-900 dark:text-white">{item.count}</span>
                                            </div>
                                            <div class="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                                <div
                                                    class={`h-full ${getStatusColor(item.status)} rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div class="card p-6">
                    <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Weekly Activity</h3>
                    <div class="flex items-end justify-between h-40 gap-2">
                        <For each={analytics().recentActivity}>
                            {(item) => (
                                <div class="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500"
                                        style={{ height: `${(item.count / maxActivityCount) * 100}%`, 'min-height': '8px' }}
                                        title={`${item.count} tasks`}
                                    />
                                    <span class="text-xs text-surface-500">{item.date}</span>
                                </div>
                            )}
                        </For>
                    </div>
                </div>

                {/* Recent Projects */}
                <div class="card p-6 mt-6">
                    <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Recent Projects</h3>
                    <Show
                        when={projects().length > 0}
                        fallback={<p class="text-surface-500">No projects yet</p>}
                    >
                        <div class="space-y-3">
                            <For each={projects().slice(0, 5)}>
                                {(project) => (
                                    <div class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white">
                                                {project.key.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p class="font-medium text-surface-900 dark:text-white">{project.name}</p>
                                                <p class="text-xs text-surface-500">{project.boardCount} boards • {project.memberCount} members</p>
                                            </div>
                                        </div>
                                        <span class="text-xs text-surface-500">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    );
};
