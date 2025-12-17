import * as signalR from '@microsoft/signalr';
import { api } from './api';
import { Task, Column, TaskMovedEvent, UserPresence } from '../types';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5000/hubs/board';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private currentBoardId: string | null = null;

    // Event handlers
    private onTaskMovedHandler: ((event: TaskMovedEvent) => void) | null = null;
    private onTaskCreatedHandler: ((task: Task) => void) | null = null;
    private onTaskUpdatedHandler: ((task: Task) => void) | null = null;
    private onTaskDeletedHandler: ((taskId: string) => void) | null = null;
    private onColumnCreatedHandler: ((column: Column) => void) | null = null;
    private onColumnUpdatedHandler: ((column: Column) => void) | null = null;
    private onColumnsReorderedHandler: ((columnIds: string[]) => void) | null = null;
    private onColumnDeletedHandler: ((columnId: string) => void) | null = null;
    private onUserJoinedHandler: ((presence: UserPresence) => void) | null = null;
    private onUserLeftHandler: ((userId: string) => void) | null = null;
    private onCurrentUsersHandler: ((users: UserPresence[]) => void) | null = null;

    async connect(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        const token = api.getToken();
        if (!token) {
            throw new Error('No authentication token');
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${HUB_URL}?access_token=${token}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Set up event handlers
        this.connection.on('TaskMoved', (event: TaskMovedEvent) => {
            this.onTaskMovedHandler?.(event);
        });

        this.connection.on('TaskCreated', (task: Task) => {
            this.onTaskCreatedHandler?.(task);
        });

        this.connection.on('TaskUpdated', (task: Task) => {
            this.onTaskUpdatedHandler?.(task);
        });

        this.connection.on('TaskDeleted', (taskId: string) => {
            this.onTaskDeletedHandler?.(taskId);
        });

        this.connection.on('ColumnCreated', (column: Column) => {
            this.onColumnCreatedHandler?.(column);
        });

        this.connection.on('ColumnUpdated', (column: Column) => {
            this.onColumnUpdatedHandler?.(column);
        });

        this.connection.on('ColumnsReordered', (columnIds: string[]) => {
            this.onColumnsReorderedHandler?.(columnIds);
        });

        this.connection.on('ColumnDeleted', (columnId: string) => {
            this.onColumnDeletedHandler?.(columnId);
        });

        this.connection.on('UserJoined', (presence: UserPresence) => {
            this.onUserJoinedHandler?.(presence);
        });

        this.connection.on('UserLeft', (userId: string) => {
            this.onUserLeftHandler?.(userId);
        });

        this.connection.on('CurrentUsers', (users: UserPresence[]) => {
            this.onCurrentUsersHandler?.(users);
        });

        await this.connection.start();
    }

    async disconnect(): Promise<void> {
        if (this.currentBoardId) {
            await this.leaveBoard();
        }
        await this.connection?.stop();
        this.connection = null;
    }

    async joinBoard(boardId: string): Promise<void> {
        if (this.currentBoardId === boardId) return;

        if (this.currentBoardId) {
            await this.leaveBoard();
        }

        await this.connection?.invoke('JoinBoard', boardId);
        this.currentBoardId = boardId;
    }

    async leaveBoard(): Promise<void> {
        if (!this.currentBoardId) return;

        await this.connection?.invoke('LeaveBoard', this.currentBoardId);
        this.currentBoardId = null;
    }

    // Setters for event handlers
    onTaskMoved(handler: (event: TaskMovedEvent) => void) {
        this.onTaskMovedHandler = handler;
    }

    onTaskCreated(handler: (task: Task) => void) {
        this.onTaskCreatedHandler = handler;
    }

    onTaskUpdated(handler: (task: Task) => void) {
        this.onTaskUpdatedHandler = handler;
    }

    onTaskDeleted(handler: (taskId: string) => void) {
        this.onTaskDeletedHandler = handler;
    }

    onColumnCreated(handler: (column: Column) => void) {
        this.onColumnCreatedHandler = handler;
    }

    onColumnUpdated(handler: (column: Column) => void) {
        this.onColumnUpdatedHandler = handler;
    }

    onColumnsReordered(handler: (columnIds: string[]) => void) {
        this.onColumnsReorderedHandler = handler;
    }

    onColumnDeleted(handler: (columnId: string) => void) {
        this.onColumnDeletedHandler = handler;
    }

    onUserJoined(handler: (presence: UserPresence) => void) {
        this.onUserJoinedHandler = handler;
    }

    onUserLeft(handler: (userId: string) => void) {
        this.onUserLeftHandler = handler;
    }

    onCurrentUsers(handler: (users: UserPresence[]) => void) {
        this.onCurrentUsersHandler = handler;
    }

    // Remove handlers
    clearHandlers() {
        this.onTaskMovedHandler = null;
        this.onTaskCreatedHandler = null;
        this.onTaskUpdatedHandler = null;
        this.onTaskDeletedHandler = null;
        this.onColumnCreatedHandler = null;
        this.onColumnUpdatedHandler = null;
        this.onColumnsReorderedHandler = null;
        this.onColumnDeletedHandler = null;
        this.onUserJoinedHandler = null;
        this.onUserLeftHandler = null;
        this.onCurrentUsersHandler = null;
    }
}

export const signalRService = new SignalRService();
