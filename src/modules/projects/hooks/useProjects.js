import { useCallback, useEffect, useState } from 'react';
import {
  createProject as createProjectService,
  listProjects,
  updateProject as updateProjectService,
} from '../services/projectsService.js';

function getProjectMutationErrorMessage(action, err) {
  const rawMessage = String(err?.message || '').trim();
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes('nicht gefunden') || normalizedMessage.includes('not found')) {
    return 'Projekt wurde nicht gefunden.';
  }

  if (action === 'create') {
    return 'Projekt konnte nicht angelegt werden.';
  }

  return 'Projekt konnte nicht gespeichert werden.';
}

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
      } catch (err) {
        console.error('[projects] listProjects failed', err);
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
    } catch (err) {
      const userMessage = getProjectMutationErrorMessage('create', err);
      console.error('[projects] createProject failed', { input, err });
      setError(userMessage);
      throw new Error(userMessage, { cause: err });
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
    } catch (err) {
      const userMessage = getProjectMutationErrorMessage('update', err);
      console.error('[projects] updateProject failed', { projectId, input, err });
      setError(userMessage);
      throw new Error(userMessage, { cause: err });
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
