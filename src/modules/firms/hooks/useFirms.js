import { useEffect, useState } from 'react';
import { listFirms } from '../services/firmsService.js';

export function useFirms() {
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadFirms = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listFirms();
        if (isActive) {
          setFirms(items);
        }
      } catch {
        if (isActive) {
          setError('Firmen konnten nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadFirms();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
  };
}
