import { Component, For, Show, onMount, createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { MainLayout } from '../components/layout/MainLayout';
import { projectStore } from '../stores/projectStore';
import { authStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { uiStore } from '../stores/uiStore';

const Dashboard: Component = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);
    const [newProjectName, setNewProjectName] = createSignal('');
    const [newProjectKey, setNewProjectKey] = createSignal('');
    const [newProjectDescription, setNewProjectDescription] = createSignal('');
    const [isCreating, setIsCreating] = createSignal(false);

    onMount(() => {
        projectStore.loadProjects();
    });

    const handleCreateProject = async () => {
        if (!newProjectName().trim() || !newProjectKey().trim()) return;

        setIsCreating(true);
        try {
            await projectStore.createProject(
                newProjectName(),
                newProjectKey().toUpperCase(),
                newProjectDescription() || undefined
            );
            setIsCreateModalOpen(false);
            setNewProjectName('');
            setNewProjectKey('');
            setNewProjectDescription('');
            uiStore.showSuccess('Project created successfully!');
        } catch (error) {
            uiStore.showError(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setIsCreating(false);
        }
    };

    const stats = [
        {
            label: 'Total Projects',
            value: projectStore.projects().length,
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Active Boards',
            value: projectStore.projects().reduce((acc, p) => acc + p.boardCount, 0),
            icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
            color: 'from-purple-500 to-purple-600',
        },
        {
            label: 'Team Members',
            value: projectStore.projects().reduce((acc, p) => acc + p.memberCount, 0),
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            color: 'from-green-500 to-green-600',
        },
        {
            label: 'Your Role',
            value: authStore.user()?.role || 'Member',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            color: 'from-amber-500 to-amber-600',
        },
    ];

    return (
        <MainLayout title="Dashboard">
            {/* Welcome */}
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-surface-900 dark:text-white">
                    Welcome back, {authStore.user()?.firstName}! 👋
                </h1>
                <p class="text-surface-500 mt-1">Here's what's happening with your projects today.</p>
            </div>

            {/* Stats */}
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

            {/* Projects */}
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-surface-900 dark:text-white">Your Projects</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </Button>
            </div>

            <Show
                when={!projectStore.isLoading()}
                fallback={
                    <div class="flex justify-center py-12">
                        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                }
            >
                <Show
                    when={projectStore.projects().length > 0}
                    fallback={
                        <div class="card p-12 text-center">
                            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-surface-900 dark:text-white mb-2">No projects yet</h3>
                            <p class="text-surface-500 mb-6">Get started by creating your first project</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>Create your first project</Button>
                        </div>
                    }
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <For each={projectStore.projects()}>
                            {(project) => (
                                <A href={`/projects/${project.id}`} class="card card-hover p-5 block">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white">
                                            {project.key.substring(0, 2)}
                                        </div>
                                        <span class="text-xs text-surface-500">{project.key}</span>
                                    </div>
                                    <h3 class="font-semibold text-surface-900 dark:text-white mb-1">{project.name}</h3>
                                    <p class="text-sm text-surface-500 line-clamp-2 mb-4">
                                        {project.description || 'No description'}
                                    </p>
                                    <div class="flex items-center gap-4 text-xs text-surface-500">
                                        <span class="flex items-center gap-1">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                            </svg>
                                            {project.boardCount} boards
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            {project.memberCount} members
                                        </span>
                                    </div>
                                </A>
                            )}
                        </For>
                    </div>
                </Show>
            </Show>

            {/* Create Project Modal */}
            <Modal
                isOpen={isCreateModalOpen()}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Project"
            >
                <div class="space-y-4">
                    <Input
                        label="Project Name"
                        value={newProjectName()}
                        onInput={(e) => setNewProjectName(e.currentTarget.value)}
                        placeholder="My Awesome Project"
                    />
                    <Input
                        label="Project Key"
                        value={newProjectKey()}
                        onInput={(e) => setNewProjectKey(e.currentTarget.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 10))}
                        placeholder="MAP"
                        maxLength={10}
                    />
                    <p class="text-xs text-surface-500 -mt-2">
                        A short unique identifier for tasks (e.g., MAP-1, MAP-2)
                    </p>
                    <Textarea
                        label="Description (optional)"
                        value={newProjectDescription()}
                        onInput={(e) => setNewProjectDescription(e.currentTarget.value)}
                        placeholder="Describe your project..."
                    />
                    <div class="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} isLoading={isCreating()}>
                            Create Project
                        </Button>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
};

export default Dashboard;
