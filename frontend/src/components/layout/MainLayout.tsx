import { Component, JSX, onMount } from 'solid-js';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';
import { uiStore } from '../../stores/uiStore';
import { projectStore } from '../../stores/projectStore';

interface MainLayoutProps {
    children: JSX.Element;
    title?: string;
}

export const MainLayout: Component<MainLayoutProps> = (props) => {
    onMount(() => {
        uiStore.initializeDarkMode();
        projectStore.loadProjects();
    });

    return (
        <div class="min-h-screen bg-surface-50 dark:bg-surface-950">
            <Sidebar />

            <div class={`transition-all duration-300 ${uiStore.isSidebarOpen() ? 'lg:ml-64' : ''}`}>
                <Header title={props.title} />

                <main class="p-6">
                    {props.children}
                </main>
            </div>

            <ToastContainer />
        </div>
    );
};
