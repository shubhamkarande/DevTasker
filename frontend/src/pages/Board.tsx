import { Component, createSignal, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import { MainLayout } from '../components/layout/MainLayout';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { SprintPlanning } from '../components/board/SprintPlanning';
import { BurndownChartDemo } from '../components/board/BurndownChart';
import { boardStore } from '../stores/boardStore';

type BoardView = 'kanban' | 'sprint' | 'burndown';

const Board: Component = () => {
    const params = useParams<{ id: string }>();
    const [activeView, setActiveView] = createSignal<BoardView>('kanban');

    const views = [
        { id: 'kanban' as const, label: 'Kanban Board', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
        { id: 'sprint' as const, label: 'Sprint Planning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'burndown' as const, label: 'Burndown Chart', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ];

    // Get all tasks from all columns for sprint planning
    const allTasks = () => {
        const board = boardStore.board();
        if (!board) return [];
        return board.columns.flatMap(col => col.tasks);
    };

    return (
        <MainLayout>
            {/* View Tabs */}
            <div class="mb-4 flex items-center gap-2 border-b border-surface-200 dark:border-surface-700">
                {views.map((view) => (
                    <button
                        class={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeView() === view.id
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                            }`}
                        onClick={() => setActiveView(view.id)}
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={view.icon} />
                        </svg>
                        {view.label}
                    </button>
                ))}
            </div>

            {/* View Content */}
            <Show when={activeView() === 'kanban'}>
                <KanbanBoard boardId={params.id} />
            </Show>

            <Show when={activeView() === 'sprint'}>
                <SprintPlanning
                    projectId={boardStore.board()?.projectId || ''}
                    tasks={allTasks()}
                />
            </Show>

            <Show when={activeView() === 'burndown'}>
                <BurndownChartDemo />
            </Show>
        </MainLayout>
    );
};

export default Board;
