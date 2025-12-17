import { Component, createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { uiStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const LoginForm: Component = () => {
    const navigate = useNavigate();
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authStore.login(email(), password());
            uiStore.showSuccess('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 p-4">
            <div class="w-full max-w-md">
                {/* Logo */}
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-4">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-white">DevTasker</h1>
                    <p class="text-surface-500 mt-1">Plan smarter. Ship faster. Stay aligned.</p>
                </div>

                {/* Form */}
                <div class="card p-6">
                    <h2 class="text-xl font-semibold text-surface-900 dark:text-white mb-6">Sign in to your account</h2>

                    {error() && (
                        <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} class="space-y-4">
                        <Input
                            type="email"
                            label="Email address"
                            value={email()}
                            onInput={(e) => setEmail(e.currentTarget.value)}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" class="w-full" isLoading={isLoading()}>
                            Sign in
                        </Button>
                    </form>

                    <p class="mt-6 text-center text-sm text-surface-500">
                        Don't have an account?{' '}
                        <A href="/register" class="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </A>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div class="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p class="text-sm text-primary-700 dark:text-primary-300 text-center">
                        <strong>Demo:</strong> Register a new account to get started
                    </p>
                </div>
            </div>
        </div>
    );
};
