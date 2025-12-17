import { createSignal, createRoot } from 'solid-js';
import { Project, ProjectDetail } from '../types';
import { api } from '../services/api';

function createProjectStore() {
    const [projects, setProjects] = createSignal<Project[]>([]);
    const [currentProject, setCurrentProject] = createSignal<ProjectDetail | null>(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const loadProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getProjects() as Project[];
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const loadProject = async (projectId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getProject(projectId) as ProjectDetail;
            setCurrentProject(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project');
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async (name: string, key: string, description?: string) => {
        const newProject = await api.createProject({ name, key, description }) as Project;
        setProjects(prev => [...prev, newProject]);
        return newProject;
    };

    const updateProject = async (projectId: string, data: { name?: string; description?: string }) => {
        const updatedProject = await api.updateProject(projectId, data) as Project;
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        if (currentProject()?.id === projectId) {
            setCurrentProject(prev => prev ? { ...prev, ...updatedProject } : null);
        }
        return updatedProject;
    };

    const deleteProject = async (projectId: string) => {
        await api.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProject()?.id === projectId) {
            setCurrentProject(null);
        }
    };

    return {
        projects,
        currentProject,
        isLoading,
        error,
        loadProjects,
        loadProject,
        createProject,
        updateProject,
        deleteProject,
        setCurrentProject,
    };
}

export const projectStore = createRoot(createProjectStore);
