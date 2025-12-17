import { createSignal, createRoot } from 'solid-js';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

function createUIStore() {
    const [isDarkMode, setIsDarkMode] = createSignal(false);
    const [isSidebarOpen, setIsSidebarOpen] = createSignal(true);
    const [toasts, setToasts] = createSignal<Toast[]>([]);

    // Initialize dark mode from localStorage or system preference
    const initializeDarkMode = () => {
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) {
            const isDark = stored === 'true';
            setIsDarkMode(isDark);
            updateDarkModeClass(isDark);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
            updateDarkModeClass(prefersDark);
        }
    };

    const updateDarkModeClass = (isDark: boolean) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleDarkMode = () => {
        const newValue = !isDarkMode();
        setIsDarkMode(newValue);
        localStorage.setItem('darkMode', String(newValue));
        updateDarkModeClass(newValue);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen());
    };

    const addToast = (type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast = { id, type, message };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showSuccess = (message: string) => addToast('success', message);
    const showError = (message: string) => addToast('error', message);
    const showInfo = (message: string) => addToast('info', message);
    const showWarning = (message: string) => addToast('warning', message);

    return {
        isDarkMode,
        isSidebarOpen,
        toasts,
        initializeDarkMode,
        toggleDarkMode,
        toggleSidebar,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
}

export const uiStore = createRoot(createUIStore);
