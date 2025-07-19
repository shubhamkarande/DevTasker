import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [
    {
      id: '1',
      name: 'DevTasker App',
      description: 'Building the ultimate task management platform',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
      ],
      progress: 65,
      status: 'active',
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'React Native companion app',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      ],
      progress: 30,
      status: 'active',
    },
  ],
  currentProject: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
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
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading,
  setError,
} = projectsSlice.actions;

export default projectsSlice.reducer;