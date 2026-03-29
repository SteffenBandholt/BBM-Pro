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

  const addEmployeeToProjectFirm = (firmId, employeeInput) => {
    const employeeId = Date.now();

    setFirms((prev) =>
      prev.map((firm) => {
        if (firm.id !== firmId || firm.type !== 'project') return firm;

        const newEmployee = {
          id: employeeId,
          name: employeeInput.name,
          role: employeeInput.role,
        };

        return {
          ...firm,
          employees: [newEmployee, ...firm.employees],
        };
      }),
    );

    setSelectedFirm((prev) => {
      if (!prev || prev.id !== firmId || prev.type !== 'project') return prev;

      return {
        ...prev,
        employees: [
          {
            id: employeeId,
            name: employeeInput.name,
            role: employeeInput.role,
          },
          ...prev.employees,
        ],
      };
    });
  };

  const assignGlobalFirm = (firm) => {
    setFirms((prev) => {
      if (prev.some((existingFirm) => existingFirm.id === firm.id)) return prev;

      return [firm, ...prev];
    });

    setSelectedFirm(firm);
  };

  return {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createProjectFirm,
    addEmployeeToProjectFirm,
    assignGlobalFirm,
  };
}
