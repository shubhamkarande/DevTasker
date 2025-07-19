import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team, User, ActivityLog } from '../types';

interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [
    {
      id: '1',
      name: 'Development Team',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member' },
      ],
      projects: ['1', '2'],
      activityLog: [
        {
          id: '1',
          action: 'Task completed',
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
          timestamp: '2024-01-20T10:30:00Z',
          details: 'Completed "Design user interface" task',
        },
        {
          id: '2',
          action: 'Project created',
          user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
          timestamp: '2024-01-15T09:00:00Z',
          details: 'Created "DevTasker App" project',
        },
      ],
    },
  ],
  currentTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },
    addTeamMember: (state, action: PayloadAction<{ teamId: string; member: User }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.members.push(action.payload.member);
      }
    },
    removeTeamMember: (state, action: PayloadAction<{ teamId: string; memberId: string }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.members = team.members.filter(m => m.id !== action.payload.memberId);
      }
    },
    updateMemberRole: (state, action: PayloadAction<{ teamId: string; memberId: string; role: 'admin' | 'member' }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        const member = team.members.find(m => m.id === action.payload.memberId);
        if (member) {
          member.role = action.payload.role;
        }
      }
    },
    addActivityLog: (state, action: PayloadAction<{ teamId: string; activity: ActivityLog }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.activityLog.unshift(action.payload.activity);
      }
    },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
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
  setTeams,
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  addActivityLog,
  setCurrentTeam,
  setLoading,
  setError,
} = teamsSlice.actions;

export default teamsSlice.reducer;