import { createSignal, createRoot } from 'solid-js';
import { User } from '../types';
import { api } from '../services/api';

function createAuthStore() {
    const [user, setUser] = createSignal<User | null>(null);
    const [isLoading, setIsLoading] = createSignal(true);
    const [isAuthenticated, setIsAuthenticated] = createSignal(false);

    const initialize = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await api.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to get current user:', error);
                api.logout();
            }
        }
        setIsLoading(false);
    };

    const login = async (email: string, password: string) => {
        const response = await api.login({ email, password });
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await api.register({ email, password, firstName, lastName });
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const logout = () => {
        api.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData: Partial<User>) => {
        const current = user();
        if (current) {
            setUser({ ...current, ...userData });
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated,
        initialize,
        login,
        register,
        logout,
        updateUser,
    };
}

export const authStore = createRoot(createAuthStore);
