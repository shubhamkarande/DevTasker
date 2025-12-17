import { Component, JSX, splitProps } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: Component<InputProps> = (props) => {
    const [local, rest] = splitProps(props, ['label', 'error', 'class', 'id']);
    const inputId = local.id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div class="w-full">
            {local.label && (
                <label for={inputId} class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    {local.label}
                </label>
            )}
            <input
                id={inputId}
                class={`input ${local.error ? 'input-error' : ''} ${local.class || ''}`}
                {...rest}
            />
            {local.error && (
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{local.error}</p>
            )}
        </div>
    );
};

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea: Component<TextareaProps> = (props) => {
    const [local, rest] = splitProps(props, ['label', 'error', 'class', 'id']);
    const inputId = local.id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div class="w-full">
            {local.label && (
                <label for={inputId} class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    {local.label}
                </label>
            )}
            <textarea
                id={inputId}
                class={`input min-h-[80px] resize-y ${local.error ? 'input-error' : ''} ${local.class || ''}`}
                {...rest}
            />
            {local.error && (
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">{local.error}</p>
            )}
        </div>
    );
};
