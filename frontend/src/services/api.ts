import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getToken() {
        return this.token;
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    // Auth
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
    }

    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await this.request<AuthResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        this.setToken(response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('refreshToken');
    }

    // Users
    async getCurrentUser(): Promise<User> {
        return this.request('/users/me');
    }

    async getUsers(): Promise<User[]> {
        return this.request('/users');
    }

    // Projects
    async getProjects() {
        return this.request('/projects');
    }

    async getProject(id: string) {
        return this.request(`/projects/${id}`);
    }

    async createProject(data: { name: string; description?: string; key: string }) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProject(id: string, data: { name?: string; description?: string }) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProject(id: string) {
        return this.request(`/projects/${id}`, { method: 'DELETE' });
    }

    async addProjectMember(projectId: string, data: { email: string; role: string }) {
        return this.request(`/projects/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async removeProjectMember(projectId: string, memberId: string) {
        return this.request(`/projects/${projectId}/members/${memberId}`, {
            method: 'DELETE',
        });
    }

    // Boards
    async getProjectBoards(projectId: string) {
        return this.request(`/boards/project/${projectId}`);
    }

    async getBoard(id: string) {
        return this.request(`/boards/${id}`);
    }

    async createBoard(data: { projectId: string; name: string; createDefaultColumns?: boolean }) {
        return this.request('/boards', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBoard(id: string, data: { name?: string }) {
        return this.request(`/boards/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteBoard(id: string) {
        return this.request(`/boards/${id}`, { method: 'DELETE' });
    }

    // Columns
    async createColumn(boardId: string, data: { name: string; color?: string }) {
        return this.request(`/boards/${boardId}/columns`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateColumn(columnId: string, data: { name?: string; color?: string }) {
        return this.request(`/boards/columns/${columnId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async reorderColumns(boardId: string, columnIds: string[]) {
        return this.request(`/boards/${boardId}/columns/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ columnIds }),
        });
    }

    async deleteColumn(columnId: string) {
        return this.request(`/boards/columns/${columnId}`, { method: 'DELETE' });
    }

    // Tasks
    async getTask(id: string) {
        return this.request(`/tasks/${id}`);
    }

    async createTask(data: {
        columnId: string;
        title: string;
        description?: string;
        priority?: string;
        assigneeId?: string;
        dueDate?: string;
        storyPoints?: number;
        labelIds?: string[];
    }) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(id: string, data: {
        title?: string;
        description?: string;
        priority?: string;
        assigneeId?: string;
        dueDate?: string;
        storyPoints?: number;
        labelIds?: string[];
    }) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async moveTask(id: string, data: { columnId: string; orderIndex: number }) {
        return this.request(`/tasks/${id}/move`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(id: string) {
        return this.request(`/tasks/${id}`, { method: 'DELETE' });
    }

    // Comments
    async getTaskComments(taskId: string) {
        return this.request(`/tasks/${taskId}/comments`);
    }

    async addComment(taskId: string, content: string) {
        return this.request(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async deleteComment(commentId: string) {
        return this.request(`/tasks/comments/${commentId}`, { method: 'DELETE' });
    }

    // Labels
    async createLabel(projectId: string, data: { name: string; color: string }) {
        return this.request(`/projects/${projectId}/labels`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteLabel(projectId: string, labelId: string) {
        return this.request(`/projects/${projectId}/labels/${labelId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiService();
