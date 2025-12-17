import { Component, For, Show } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { projectStore } from '../../stores/projectStore';
import { uiStore } from '../../stores/uiStore';

export const Sidebar: Component = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ];

    const adminItems = [
        { path: '/admin', label: 'Administration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    return (
        <aside class={`sidebar transition-all duration-300 ${uiStore.isSidebarOpen() ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Logo */}
            <div class="flex items-center gap-3 px-4 py-5 border-b border-surface-700">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <span class="text-xl font-bold text-white">DevTasker</span>
            </div>

            {/* Navigation */}
            <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <For each={navItems}>
                    {(item) => (
                        <A
                            href={item.path}
                            class={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                            </svg>
                            {item.label}
                        </A>
                    )}
                </For>

                {/* Recent Projects */}
                <div class="pt-6">
                    <h3 class="px-4 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                        Recent Projects
                    </h3>
                    <For each={projectStore.projects().slice(0, 5)}>
                        {(project) => (
                            <A
                                href={`/projects/${project.id}`}
                                class={`sidebar-link ${isActive(`/projects/${project.id}`) ? 'sidebar-link-active' : ''}`}
                            >
                                <div class="w-5 h-5 rounded bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-[10px] font-bold text-white">
                                    {project.key.substring(0, 2)}
                                </div>
                                <span class="truncate">{project.name}</span>
                            </A>
                        )}
                    </For>
                </div>

                {/* Admin Section */}
                <Show when={authStore.user()?.role === 'Admin'}>
                    <div class="pt-6">
                        <h3 class="px-4 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                            Administration
                        </h3>
                        <For each={adminItems}>
                            {(item) => (
                                <A
                                    href={item.path}
                                    class={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                                    </svg>
                                    {item.label}
                                </A>
                            )}
                        </For>
                    </div>
                </Show>
            </nav>

            {/* User */}
            <div class="p-4 border-t border-surface-700">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-medium text-white">
                        {authStore.user()?.firstName?.charAt(0)}{authStore.user()?.lastName?.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">
                            {authStore.user()?.firstName} {authStore.user()?.lastName}
                        </p>
                        <p class="text-xs text-surface-400 truncate">{authStore.user()?.email}</p>
                    </div>
                    <button
                        onClick={() => authStore.logout()}
                        class="p-2 text-surface-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
};
