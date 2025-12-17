import { Component, JSX, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: JSX.Element;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: Component<ModalProps> = (props) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            props.onClose();
        }
    };

    onMount(() => {
        document.addEventListener('keydown', handleKeyDown);
    });

    onCleanup(() => {
        document.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <Show when={props.isOpen}>
            <Portal>
                <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={props.onClose}
                    />

                    {/* Modal */}
                    <div
                        class={`relative w-full ${sizes[props.size || 'md']} bg-white dark:bg-surface-800 rounded-xl shadow-modal animate-scale-in`}
                    >
                        {/* Header */}
                        <Show when={props.title}>
                            <div class="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                                <h2 class="text-lg font-semibold text-surface-900 dark:text-white">
                                    {props.title}
                                </h2>
                                <button
                                    onClick={props.onClose}
                                    class="p-1 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </Show>

                        {/* Content */}
                        <div class="p-4">
                            {props.children}
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    );
};
