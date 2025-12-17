import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { User } from '../../types';
import { api } from '../../services/api';
import { uiStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';

export const UserManagement: Component = () => {
    const [users, setUsers] = createSignal<User[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [selectedUser, setSelectedUser] = createSignal<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
    const [editRole, setEditRole] = createSignal('');
    const [searchQuery, setSearchQuery] = createSignal('');

    onMount(async () => {
        await loadUsers();
    });

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers() as User[];
            setUsers(data);
        } catch (error) {
            uiStore.showError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = () => {
        const query = searchQuery().toLowerCase();
        if (!query) return users();
        return users().filter(u =>
            u.email.toLowerCase().includes(query) ||
            u.firstName.toLowerCase().includes(query) ||
            u.lastName.toLowerCase().includes(query)
        );
    };

    const handleEditRole = (user: User) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setIsEditModalOpen(true);
    };

    const handleSaveRole = async () => {
        const user = selectedUser();
        if (!user) return;

        try {
            await api.request(`/users/${user.id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: editRole() }),
            });
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: editRole() } : u));
            setIsEditModalOpen(false);
            uiStore.showSuccess('Role updated successfully');
        } catch (error) {
            uiStore.showError('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.request(`/users/${userId}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u.id !== userId));
            uiStore.showSuccess('User deleted');
        } catch (error) {
            uiStore.showError('Failed to delete user');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'ProjectManager': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div>
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold text-surface-900 dark:text-white">User Management</h2>
                    <p class="text-surface-500 mt-1">Manage user accounts and permissions</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery()}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            class="w-64 pl-10 pr-4 py-2 text-sm bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <Show
                when={!isLoading()}
                fallback={
                    <div class="flex justify-center py-12">
                        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                }
            >
                <div class="card overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-surface-50 dark:bg-surface-800/50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">User</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Role</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Joined</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
                            <For each={filteredUsers()}>
                                {(user) => (
                                    <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center gap-3">
                                                <Avatar user={user} size="md" />
                                                <span class="font-medium text-surface-900 dark:text-white">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-300">
                                            {user.email}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class={`badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleEditRole(user)}>
                                                    Edit Role
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>

                    <Show when={filteredUsers().length === 0}>
                        <div class="text-center py-12 text-surface-500">
                            No users found
                        </div>
                    </Show>
                </div>
            </Show>

            {/* Edit Role Modal */}
            <Modal
                isOpen={isEditModalOpen()}
                onClose={() => setIsEditModalOpen(false)}
                title="Change User Role"
            >
                <div class="space-y-4">
                    <p class="text-surface-600 dark:text-surface-300">
                        Editing role for <strong>{selectedUser()?.firstName} {selectedUser()?.lastName}</strong>
                    </p>
                    <div>
                        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Role
                        </label>
                        <select
                            value={editRole()}
                            onChange={(e) => setEditRole(e.currentTarget.value)}
                            class="input"
                        >
                            <option value="TeamMember">Team Member</option>
                            <option value="ProjectManager">Project Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRole}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
