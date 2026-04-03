import { getRepos } from '../../../services/repositories/index.js';

const {
  globalFirmEmployeesRepo,
  globalFirmsRepo,
  projectFirmsRepo,
  projectFirmEmployeesRepo,
} = getRepos();

function mapEmployeeToUi(employee, { active = false } = {}) {
  return {
    id: employee.id,
    name: employee.name || 'Mitarbeiter',
    active,
  };
}

function mapProjectFirmToUi(firm, employees = []) {
  return {
    id: firm.id,
    name: firm.name || 'Firma',
    type: firm.global_firm_id ? 'global' : 'project',
    globalFirmId: firm.global_firm_id || null,
    employees,
    activeEmployees: employees.filter((employee) => employee.active),
  };
}

async function loadEmployeesForProjectFirm(firm) {
  if (!firm.global_firm_id) {
    return [];
  }

  const [globalEmployees, activeEmployees] = await Promise.all([
    globalFirmEmployeesRepo.listByFirm(firm.global_firm_id),
    projectFirmEmployeesRepo.listByProjectFirm(firm.id),
  ]);
  const activeEmployeeIds = new Set(activeEmployees.map((employee) => String(employee.global_employee_id)));

  return globalEmployees.map((employee) =>
    mapEmployeeToUi(employee, { active: activeEmployeeIds.has(String(employee.id)) }),
  );
}

export async function listProjectParticipants(projectId) {
  const firms = await projectFirmsRepo.listByProject(projectId);
  const firmsWithEmployees = await Promise.all(
    firms.map(async (firm) => {
      const employees = await loadEmployeesForProjectFirm(firm);
      return mapProjectFirmToUi(firm, employees);
    }),
  );
  return firmsWithEmployees;
}

export async function createProjectFirm({ projectId, name, shortLabel = '' }) {
  return projectFirmsRepo.createFirm({
    projectId,
    name,
    shortLabel,
  });
}

export async function assignGlobalFirmToProject({ projectId, globalFirmId }) {
  const globalFirm = await globalFirmsRepo.getById(globalFirmId);
  if (!globalFirm) {
    throw new Error('Globale Firma wurde nicht gefunden.');
  }

  const existingProjectFirms = await projectFirmsRepo.listByProject(projectId);
  const existingAssignment = existingProjectFirms.find(
    (firm) => String(firm.global_firm_id || '') === String(globalFirm.id),
  );

  if (existingAssignment) {
    return existingAssignment;
  }

  return projectFirmsRepo.createFirm({
    projectId,
    name: globalFirm.name,
    shortLabel: globalFirm.short_label || globalFirm.name,
    globalFirmId: globalFirm.id,
  });
}

export async function removeProjectFirm(projectFirmId) {
  return projectFirmsRepo.removeFirm(projectFirmId);
}

export async function activateProjectEmployee({ projectFirmId, globalEmployeeId }) {
  const [projectFirm, globalEmployee] = await Promise.all([
    projectFirmsRepo.getById(projectFirmId),
    globalFirmEmployeesRepo.getById(globalEmployeeId),
  ]);

  if (!projectFirm) {
    throw new Error('Projektfirma wurde nicht gefunden.');
  }
  if (!projectFirm.global_firm_id) {
    throw new Error('Projektfirma ist keiner globalen Firma zugeordnet.');
  }
  if (!globalEmployee) {
    throw new Error('Mitarbeiter wurde nicht gefunden.');
  }
  if (String(globalEmployee.global_firm_id) !== String(projectFirm.global_firm_id)) {
    throw new Error('Mitarbeiter gehoert nicht zu dieser Firma.');
  }

  return projectFirmEmployeesRepo.activateEmployee({
    projectFirmId,
    globalEmployeeId,
  });
}

export async function deactivateProjectEmployee({ projectFirmId, globalEmployeeId }) {
  return projectFirmEmployeesRepo.deactivateEmployee({
    projectFirmId,
    globalEmployeeId,
  });
}
