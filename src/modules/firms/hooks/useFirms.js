import { useEffect, useState } from 'react';
import { createFirm, createFirmEmployee, listFirms } from '../services/firmsService.js';

export function useFirms() {
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFirms = async () => {
    try {
      setLoading(true);
      setError('');
      const items = await listFirms();
      setFirms(items);
      setSelectedFirm((currentSelectedFirm) => {
        if (!currentSelectedFirm) {
          return items[0] || null;
        }

        return items.find((firm) => String(firm.id) === String(currentSelectedFirm.id)) || items[0] || null;
      });
      return items;
    } catch (err) {
      console.error('[firms] load failed', err);
      setError('Firmen konnten nicht geladen werden.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFirms();
  }, []);

  const createGlobalFirm = async (input) => {
    try {
      setError('');
      const createdFirm = await createFirm(input);
      await loadFirms();
      setSelectedFirm(createdFirm);
      return createdFirm;
    } catch (err) {
      console.error('[firms] create failed', err);
      const nextMessage = err?.message || 'Firma konnte nicht angelegt werden.';
      setError(nextMessage);
      return null;
    }
  };

  const createEmployeeForFirm = async ({ firmId, name }) => {
    try {
      setError('');
      const createdEmployee = await createFirmEmployee({
        globalFirmId: firmId,
        name,
      });
      await loadFirms();
      setSelectedFirm((currentSelectedFirm) => {
        if (!currentSelectedFirm) {
          return currentSelectedFirm;
        }
        if (String(currentSelectedFirm.id) !== String(firmId)) {
          return currentSelectedFirm;
        }
        return {
          ...currentSelectedFirm,
          employees: [...(currentSelectedFirm.employees || []), createdEmployee].sort((a, b) =>
            (a.name || '').localeCompare(b.name || ''),
          ),
        };
      });
      return createdEmployee;
    } catch (err) {
      console.error('[firms] create employee failed', err);
      const nextMessage = err?.message || 'Mitarbeiter konnte nicht angelegt werden.';
      setError(nextMessage);
      return null;
    }
  };

  return {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createGlobalFirm,
    createEmployeeForFirm,
  };
}
