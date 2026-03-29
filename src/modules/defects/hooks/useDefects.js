import { useEffect, useState } from 'react';
import { listDefects } from '../services/defectsService.js';

export function useDefects() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadDefects = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listDefects();
        if (isActive) {
          setDefects(items);
        }
      } catch {
        if (isActive) {
          setError('Mängel konnten nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDefects();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    defects,
    loading,
    error,
  };
}
