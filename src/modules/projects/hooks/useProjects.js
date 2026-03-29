import { useCallback, useEffect, useState } from 'react';
import {
  createProject as createProjectService,
  listProjects,
  updateProject as updateProjectService,
} from '../services/projectsService.js';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listProjects();
        if (isActive) {
          setProjects(items);
        }
      } catch {
        if (isActive) {
          setError('Projekte konnten nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isActive = false;
    };
  }, []);

  const createProject = useCallback(async (input) => {
    try {
      const createdProject = await createProjectService(input);
      setProjects((currentProjects) => [createdProject, ...currentProjects]);
      setError('');
      return createdProject;
    } catch {
      setError('Projekt konnte nicht angelegt werden.');
      throw new Error('Projekt konnte nicht angelegt werden.');
    }
  }, []);

  const updateProject = useCallback(async (projectId, input) => {
    try {
      const updatedProject = await updateProjectService(projectId, input);
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          String(project.id) === String(projectId) ? updatedProject : project,
        ),
      );
      setError('');
      return updatedProject;
    } catch {
      setError('Projekt konnte nicht gespeichert werden.');
      throw new Error('Projekt konnte nicht gespeichert werden.');
    }
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
  };
}
