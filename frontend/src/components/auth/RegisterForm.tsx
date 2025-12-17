import { Component, createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { uiStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const RegisterForm: Component = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = createSignal('');
    const [lastName, setLastName] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');

        if (password() !== confirmPassword()) {
            setError('Passwords do not match');
            return;
        }

        if (password().length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await authStore.register(email(), password(), firstName(), lastName());
            uiStore.showSuccess('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
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
                    <h2 class="text-xl font-semibold text-surface-900 dark:text-white mb-6">Create your account</h2>

                    {error() && (
                        <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="First name"
                                value={firstName()}
                                onInput={(e) => setFirstName(e.currentTarget.value)}
                                placeholder="John"
                                required
                            />

                            <Input
                                type="text"
                                label="Last name"
                                value={lastName()}
                                onInput={(e) => setLastName(e.currentTarget.value)}
                                placeholder="Doe"
                                required
                            />
                        </div>

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

                        <Input
                            type="password"
                            label="Confirm password"
                            value={confirmPassword()}
                            onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" class="w-full" isLoading={isLoading()}>
                            Create account
                        </Button>
                    </form>

                    <p class="mt-6 text-center text-sm text-surface-500">
                        Already have an account?{' '}
                        <A href="/login" class="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </A>
                    </p>
                </div>
            </div>
        </div>
    );
};
