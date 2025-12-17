import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { useParams, A, useNavigate } from '@solidjs/router';
import { MainLayout } from '../components/layout/MainLayout';
import { projectStore } from '../stores/projectStore';
import { uiStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { api } from '../services/api';
import { BoardSummary } from '../types';

const Project: Component = () => {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isCreateBoardOpen, setIsCreateBoardOpen] = createSignal(false);
    const [newBoardName, setNewBoardName] = createSignal('');
    const [isCreating, setIsCreating] = createSignal(false);

    onMount(() => {
        projectStore.loadProject(params.id);
    });

    const handleCreateBoard = async () => {
        if (!newBoardName().trim()) return;

        setIsCreating(true);
        try {
            const board = await api.createBoard({
                projectId: params.id,
                name: newBoardName(),
                createDefaultColumns: true,
            }) as BoardSummary;
            setIsCreateBoardOpen(false);
            setNewBoardName('');
            uiStore.showSuccess('Board created!');
            navigate(`/boards/${board.id}`);
        } catch (error) {
            uiStore.showError('Failed to create board');
        } finally {
            setIsCreating(false);
        }
    };

    const project = () => projectStore.currentProject();

    return (
        <MainLayout title={project()?.name || 'Project'}>
            <Show
                when={!projectStore.isLoading() && project()}
                fallback={
                    <div class="flex justify-center py-12">
                        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                }
            >
                {/* Header */}
                <div class="flex items-start justify-between mb-8">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-lg font-bold text-white">
                                {project()!.key.substring(0, 2)}
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-surface-900 dark:text-white">{project()!.name}</h1>
                                <p class="text-surface-500">{project()!.key}</p>
                            </div>
                        </div>
                        <p class="text-surface-600 dark:text-surface-300 mt-2">
                            {project()!.description || 'No description'}
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateBoardOpen(true)}>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Board
                    </Button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Boards */}
                    <div class="lg:col-span-2">
                        <h2 class="text-lg font-semibold text-surface-900 dark:text-white mb-4">Boards</h2>
                        <Show
                            when={project()!.boards.length > 0}
                            fallback={
                                <div class="card p-8 text-center">
                                    <p class="text-surface-500 mb-4">No boards yet. Create one to get started!</p>
                                    <Button onClick={() => setIsCreateBoardOpen(true)}>Create Board</Button>
                                </div>
                            }
                        >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <For each={project()!.boards}>
                                    {(board) => (
                                        <A href={`/boards/${board.id}`} class="card card-hover p-5 block">
                                            <div class="flex items-center justify-between mb-3">
                                                <h3 class="font-medium text-surface-900 dark:text-white">{board.name}</h3>
                                                <span class="text-xs text-surface-500 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">
                                                    {board.taskCount} tasks
                                                </span>
                                            </div>
                                            <p class="text-xs text-surface-500">
                                                Created {new Date(board.createdAt).toLocaleDateString()}
                                            </p>
                                        </A>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>

                    {/* Sidebar */}
                    <div class="space-y-6">
                        {/* Team */}
                        <div class="card p-5">
                            <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Team Members</h3>
                            <div class="space-y-3">
                                {/* Owner */}
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-medium text-white">
                                        {project()!.ownerName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-surface-900 dark:text-white">{project()!.ownerName}</p>
                                        <p class="text-xs text-surface-500">Owner</p>
                                    </div>
                                </div>
                                <For each={project()!.members}>
                                    {(member) => (
                                        <div class="flex items-center gap-3">
                                            <Avatar user={member as any} size="md" />
                                            <div class="flex-1">
                                                <p class="text-sm font-medium text-surface-900 dark:text-white">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                <p class="text-xs text-surface-500">{member.role}</p>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Labels */}
                        <Show when={project()!.labels.length > 0}>
                            <div class="card p-5">
                                <h3 class="font-semibold text-surface-900 dark:text-white mb-4">Labels</h3>
                                <div class="flex flex-wrap gap-2">
                                    <For each={project()!.labels}>
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
                    </div>
                </div>

                {/* Create Board Modal */}
                <Modal
                    isOpen={isCreateBoardOpen()}
                    onClose={() => setIsCreateBoardOpen(false)}
                    title="Create New Board"
                >
                    <div class="space-y-4">
                        <Input
                            label="Board Name"
                            value={newBoardName()}
                            onInput={(e) => setNewBoardName(e.currentTarget.value)}
                            placeholder="Sprint 1"
                        />
                        <p class="text-sm text-surface-500">
                            Default columns (Backlog, Todo, In Progress, Review, Done) will be created automatically.
                        </p>
                        <div class="flex justify-end gap-2 pt-4">
                            <Button variant="secondary" onClick={() => setIsCreateBoardOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateBoard} isLoading={isCreating()}>
                                Create Board
                            </Button>
                        </div>
                    </div>
                </Modal>
            </Show>
        </MainLayout>
    );
};

export default Project;
