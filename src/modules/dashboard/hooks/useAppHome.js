import { useEffect, useState } from 'react';
import { loadAppHome } from '../services/appHomeService.js';

export function useAppHome() {
  const [lastProject, setLastProject] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [projectManagement, setProjectManagement] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await loadAppHome();

        if (isActive) {
          setLastProject(data.lastProject);
          setActiveProjects(data.activeProjects);
          setProjectManagement(data.projectManagement);
          setMasterData(data.masterData);
        }
      } catch (err) {
        console.error('[app-home] loadAppHome failed', err);

        if (isActive) {
          setError(err?.message || 'Startseite konnte nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    lastProject,
    activeProjects,
    projectManagement,
    masterData,
    loading,
    error,
  };
}
