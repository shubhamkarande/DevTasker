import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Comment } from '../types';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [
    {
      id: '1',
      title: 'Design user interface',
      description: 'Create mockups and wireframes for the main dashboard',
      status: 'done',
      priority: 'high',
      projectId: '1',
      dueDate: '2024-01-25',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      labels: ['design', 'ui'],
      comments: [],
      assignedTo: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
    },
    {
      id: '2',
      title: 'Implement authentication',
      description: 'Set up login, signup, and JWT token management',
      status: 'in-progress',
      priority: 'high',
      projectId: '1',
      dueDate: '2024-01-28',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-21',
      labels: ['backend', 'auth'],
      comments: [],
      assignedTo: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    },
    {
      id: '3',
      title: 'Setup database schema',
      description: 'Design and implement the database structure',
      status: 'todo',
      priority: 'medium',
      projectId: '1',
      dueDate: '2024-01-30',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
      labels: ['database'],
      comments: [],
    },
    {
      id: '4',
      title: 'Write unit tests',
      description: 'Create comprehensive test suite for core functionality',
      status: 'todo',
      priority: 'medium',
      projectId: '1',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
      labels: ['testing'],
      comments: [],
    },
  ],
  selectedTask: null,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; newStatus: 'todo' | 'in-progress' | 'done' }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
        task.updatedAt = new Date().toISOString();
      }
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    addComment: (state, action: PayloadAction<{ taskId: string; comment: Comment }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.comments.push(action.payload.comment);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  setSelectedTask,
  addComment,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;