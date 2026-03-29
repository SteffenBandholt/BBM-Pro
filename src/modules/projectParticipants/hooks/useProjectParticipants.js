import { useEffect, useState } from 'react';
import { listProjectParticipants } from '../services/projectParticipantsService.js';

export function useProjectParticipants() {
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProjectParticipants = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listProjectParticipants();
        if (isActive) {
          setFirms(items);
        }
      } catch {
        if (isActive) {
          setError('Projektbeteiligte konnten nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProjectParticipants();

    return () => {
      isActive = false;
    };
  }, []);

  const createProjectFirm = (name) => {
    const newFirm = {
      id: Date.now(),
      name,
      type: 'project',
      employees: [],
    };

    setFirms((prev) => [newFirm, ...prev]);
    setSelectedFirm(newFirm);
  };

  return {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createProjectFirm,
  };
}
