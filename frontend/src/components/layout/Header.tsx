import { Component, Show } from 'solid-js';
import { uiStore } from '../../stores/uiStore';
import { authStore } from '../../stores/authStore';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
    title?: string;
    showBreadcrumb?: boolean;
}

export const Header: Component<HeaderProps> = (props) => {
    return (
        <header class="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-6">
            <div class="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={() => uiStore.toggleSidebar()}
                    class="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors lg:hidden"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Title */}
                <Show when={props.title}>
                    <h1 class="text-xl font-semibold text-surface-900 dark:text-white">{props.title}</h1>
                </Show>
            </div>

            <div class="flex items-center gap-3">
                {/* Search */}
                <div class="hidden md:flex items-center">
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            class="w-64 pl-10 pr-4 py-2 text-sm bg-surface-100 dark:bg-surface-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <svg
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => uiStore.toggleDarkMode()}
                    class="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    title={uiStore.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <Show
                        when={uiStore.isDarkMode()}
                        fallback={
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        }
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </Show>
                </button>

                {/* Notifications */}
                <button class="relative p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <Avatar user={authStore.user()} size="md" />
            </div>
        </header>
    );
};
