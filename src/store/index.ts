import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import projectsReducer from './projectsSlice';
import tasksReducer from './tasksSlice';
import teamsReducer from './teamsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    teams: teamsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;