import { useEffect, useState } from 'react';
import {
  activateProjectEmployee,
  assignGlobalFirmToProject,
  createProjectFirm as createProjectFirmService,
  createProjectLocalEmployee as createProjectLocalEmployeeService,
  deactivateProjectEmployee,
  listProjectParticipants,
  removeProjectFirm as removeProjectFirmService,
  removeProjectLocalEmployee as removeProjectLocalEmployeeService,
  updateProjectFirm as updateProjectFirmService,
  updateProjectLocalEmployee as updateProjectLocalEmployeeService,
} from '../services/projectParticipantsService.js';

export function useProjectParticipants(projectId) {
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjectParticipants = async () => {
    if (!projectId) {
      setFirms([]);
      setSelectedFirm(null);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError('');
      const items = await listProjectParticipants(projectId);
      setFirms(items);
      setSelectedFirm((currentSelectedFirm) => {
        if (!currentSelectedFirm) {
          return items[0] || null;
        }
        return items.find((firm) => String(firm.id) === String(currentSelectedFirm.id)) || items[0] || null;
      });
      return items;
    } catch (err) {
      console.error('[project-participants] load failed', err);
      setError('Projektfirmen konnten nicht geladen werden.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjectParticipants();
  }, [projectId]);

  const createProjectFirm = async (name) => {
    try {
      setError('');
      const createdFirm = await createProjectFirmService({ projectId, name });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(createdFirm.id)) || null);
      return createdFirm;
    } catch (err) {
      console.error('[project-participants] create failed', err);
      setError(err?.message || 'Projektfirma konnte nicht angelegt werden.');
      return null;
    }
  };

  const updateProjectFirm = async ({ projectFirmId, name }) => {
    try {
      setError('');
      const updatedFirm = await updateProjectFirmService({ projectFirmId, name });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(updatedFirm.id)) || null);
      return updatedFirm;
    } catch (err) {
      console.error('[project-participants] update firm failed', err);
      setError(err?.message || 'Projektfirma konnte nicht bearbeitet werden.');
      return null;
    }
  };

  const assignGlobalFirm = async (firm) => {
    try {
      setError('');
      const assignedFirm = await assignGlobalFirmToProject({
        projectId,
        globalFirmId: firm.id,
      });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(assignedFirm.id)) || null);
      return assignedFirm;
    } catch (err) {
      console.error('[project-participants] assign failed', err);
      setError(err?.message || 'Globale Firma konnte nicht zugeordnet werden.');
      return null;
    }
  };

  const removeFirmFromProject = async (firmId) => {
    try {
      setError('');
      await removeProjectFirmService(firmId);
      const items = await loadProjectParticipants();
      setSelectedFirm((currentSelectedFirm) => {
        if (!currentSelectedFirm || String(currentSelectedFirm.id) !== String(firmId)) {
          return currentSelectedFirm;
        }
        return items[0] || null;
      });
      return true;
    } catch (err) {
      console.error('[project-participants] remove failed', err);
      setError(err?.message || 'Projektfirma konnte nicht entfernt werden.');
      return false;
    }
  };

  const activateEmployeeForProject = async ({ projectFirmId, globalEmployeeId }) => {
    try {
      setError('');
      await activateProjectEmployee({ projectFirmId, globalEmployeeId });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(projectFirmId)) || null);
      return true;
    } catch (err) {
      console.error('[project-participants] activate employee failed', err);
      setError(err?.message || 'Mitarbeiter konnte nicht aktiviert werden.');
      return false;
    }
  };

  const deactivateEmployeeForProject = async ({ projectFirmId, globalEmployeeId }) => {
    try {
      setError('');
      await deactivateProjectEmployee({ projectFirmId, globalEmployeeId });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(projectFirmId)) || null);
      return true;
    } catch (err) {
      console.error('[project-participants] deactivate employee failed', err);
      setError(err?.message || 'Mitarbeiter konnte nicht deaktiviert werden.');
      return false;
    }
  };

  const createProjectLocalEmployeeForFirm = async ({ projectFirmId, name }) => {
    try {
      setError('');
      await createProjectLocalEmployeeService({ projectFirmId, name });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(projectFirmId)) || null);
      return true;
    } catch (err) {
      console.error('[project-participants] create local employee failed', err);
      setError(err?.message || 'Projektinterner Mitarbeiter konnte nicht angelegt werden.');
      return false;
    }
  };

  const updateProjectLocalEmployeeForFirm = async ({ projectFirmId, employeeId, name }) => {
    try {
      setError('');
      await updateProjectLocalEmployeeService({ projectFirmId, employeeId, name });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(projectFirmId)) || null);
      return true;
    } catch (err) {
      console.error('[project-participants] update local employee failed', err);
      setError(err?.message || 'Projektinterner Mitarbeiter konnte nicht bearbeitet werden.');
      return false;
    }
  };

  const removeProjectLocalEmployeeForFirm = async ({ projectFirmId, employeeId }) => {
    try {
      setError('');
      await removeProjectLocalEmployeeService({ projectFirmId, employeeId });
      const items = await loadProjectParticipants();
      setSelectedFirm(items.find((item) => String(item.id) === String(projectFirmId)) || null);
      return true;
    } catch (err) {
      console.error('[project-participants] remove local employee failed', err);
      setError(err?.message || 'Projektinterner Mitarbeiter konnte nicht geloescht werden.');
      return false;
    }
  };

  return {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createProjectFirm,
    updateProjectFirm,
    assignGlobalFirm,
    removeFirmFromProject,
    activateEmployeeForProject,
    deactivateEmployeeForProject,
    createProjectLocalEmployeeForFirm,
    updateProjectLocalEmployeeForFirm,
    removeProjectLocalEmployeeForFirm,
  };
}
