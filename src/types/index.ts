export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  members: User[];
  progress: number;
  status: 'active' | 'completed' | 'archived';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: User;
  projectId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  projects: string[];
  activityLog: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  user: User;
  timestamp: string;
  details: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  currentProject: Project | null;
  theme: 'light' | 'dark';
}