import { useCallback, useEffect, useState } from 'react';
import { createProject as createProjectService, listProjects } from '../services/projectsService.js';

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
    const createdProject = await createProjectService(input);
    setProjects((currentProjects) => [createdProject, ...currentProjects]);
    return createdProject;
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
  };
}
