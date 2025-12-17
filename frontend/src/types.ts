// API Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    key: string;
    ownerId: string;
    ownerName: string;
    createdAt: string;
    boardCount: number;
    memberCount: number;
}

export interface ProjectDetail {
    id: string;
    name: string;
    description?: string;
    key: string;
    ownerId: string;
    ownerName: string;
    createdAt: string;
    boards: BoardSummary[];
    members: ProjectMember[];
    labels: Label[];
}

export interface BoardSummary {
    id: string;
    name: string;
    taskCount: number;
    createdAt: string;
}

export interface ProjectMember {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
}

export interface Board {
    id: string;
    projectId: string;
    projectName: string;
    projectKey: string;
    name: string;
    createdAt: string;
    columns: Column[];
}

export interface Column {
    id: string;
    name: string;
    orderIndex: number;
    color?: string;
    tasks: Task[];
}

export interface Task {
    id: string;
    taskKey?: string;
    title: string;
    description?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    orderIndex: number;
    dueDate?: string;
    storyPoints?: number;
    createdAt: string;
    assignee?: User;
    labels: Label[];
    commentCount: number;
}

export interface TaskDetail extends Task {
    columnId: string;
    columnName: string;
    updatedAt?: string;
    comments: Comment[];
    activityLogs: ActivityLog[];
}

export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface Comment {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    updatedAt?: string;
}

export interface ActivityLog {
    id: string;
    action: string;
    details?: string;
    user: User;
    createdAt: string;
}

// Request Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    key: string;
}

export interface CreateBoardRequest {
    projectId: string;
    name: string;
    createDefaultColumns?: boolean;
}

export interface CreateTaskRequest {
    columnId: string;
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    storyPoints?: number;
    labelIds?: string[];
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    storyPoints?: number;
    labelIds?: string[];
}

export interface MoveTaskRequest {
    columnId: string;
    orderIndex: number;
}

export interface CreateColumnRequest {
    name: string;
    color?: string;
}

// SignalR Events
export interface TaskMovedEvent {
    taskId: string;
    sourceColumnId: string;
    targetColumnId: string;
    newOrderIndex: number;
}

export interface UserPresence {
    userId: string;
    userName: string;
}
