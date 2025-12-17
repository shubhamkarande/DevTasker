import { Component, createSignal } from 'solid-js';
import { MainLayout } from '../components/layout/MainLayout';
import { UserManagement } from '../components/admin/UserManagement';
import { Analytics } from '../components/admin/Analytics';

const Admin: Component = () => {
    const [activeTab, setActiveTab] = createSignal<'users' | 'analytics'>('users');

    const tabs = [
        { id: 'users' as const, label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'analytics' as const, label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ];

    return (
        <MainLayout title="Administration">
            <div class="mb-6">
                <div class="flex gap-2 border-b border-surface-200 dark:border-surface-700">
                    {tabs.map((tab) => (
                        <button
                            class={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab() === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab() === 'users' && <UserManagement />}
            {activeTab() === 'analytics' && <Analytics />}
        </MainLayout>
    );
};

export default Admin;
