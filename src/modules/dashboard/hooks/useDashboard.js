import { useEffect, useState } from 'react';
import { loadDashboard } from '../services/dashboardService.js';

export function useDashboard() {
  const [modules, setModules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await loadDashboard();
        if (isActive) {
          setModules(data.modules);
          setProjects(data.projects);
        }
      } catch (err) {
        // Sichtbar machen, warum das Dashboard nicht lädt.
        console.error('[dashboard] loadDashboard failed', err);
        if (isActive) {
          setError(err?.message || 'Dashboard konnte nicht geladen werden.');
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
    modules,
    projects,
    loading,
    error,
  };
}
