import { getRepos } from '../../../services/repositories/index.js';

const {
  globalFirmEmployeesRepo,
  globalFirmsRepo,
  projectFirmsRepo,
  projectFirmEmployeesRepo,
  projectLocalFirmEmployeesRepo,
} = getRepos();

function sortByName(a, b) {
  return (a.name || '').localeCompare(b.name || '');
}

function mapGlobalEmployeeToUi(employee, { active = false } = {}) {
  return {
    id: employee.id,
    name: employee.name || 'Mitarbeiter',
    active,
    source: 'global',
  };
}

function mapProjectLocalEmployeeToUi(employee) {
  return {
    id: employee.id,
    name: employee.name || 'Mitarbeiter',
    source: 'project-local',
  };
}

function mapProjectFirmToUi(firm, { availableGlobalEmployees = [], activeGlobalEmployees = [], projectLocalEmployees = [] } = {}) {
  const projectEmployees = [...activeGlobalEmployees, ...projectLocalEmployees].sort(sortByName);
  return {
    id: firm.id,
    name: firm.name || 'Firma',
    type: firm.global_firm_id ? 'global' : 'project',
    globalFirmId: firm.global_firm_id || null,
    employees: availableGlobalEmployees,
    activeEmployees: activeGlobalEmployees,
    projectLocalEmployees,
    projectEmployees,
    projectEmployeeCount: projectEmployees.length,
  };
}

async function loadEmployeesForProjectFirm(firm) {
  const [projectLocalEmployees, activeEmployeeRows, globalEmployees] = await Promise.all([
    projectLocalFirmEmployeesRepo.listByProjectFirm(firm.id),
    projectFirmEmployeesRepo.listByProjectFirm(firm.id),
    firm.global_firm_id ? globalFirmEmployeesRepo.listByFirm(firm.global_firm_id) : Promise.resolve([]),
  ]);
  const activeEmployeeIds = new Set(activeEmployeeRows.map((employee) => String(employee.global_employee_id)));
  const availableGlobalEmployees = globalEmployees
    .map((employee) => mapGlobalEmployeeToUi(employee, { active: activeEmployeeIds.has(String(employee.id)) }))
    .sort(sortByName);

  return {
    availableGlobalEmployees,
    activeGlobalEmployees: availableGlobalEmployees.filter((employee) => employee.active),
    projectLocalEmployees: projectLocalEmployees.map(mapProjectLocalEmployeeToUi).sort(sortByName),
  };
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

export async function updateProjectFirm({ projectFirmId, name }) {
  const projectFirm = await projectFirmsRepo.getById(projectFirmId);

  if (!projectFirm) {
    throw new Error('Projektfirma wurde nicht gefunden.');
  }
  if (projectFirm.global_firm_id) {
    throw new Error('Globale Projektfirmen werden in diesem Schritt nicht bearbeitet.');
  }

  return projectFirmsRepo.updateFirm({
    firmId: projectFirmId,
    name,
    shortLabel: name,
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

export async function createProjectLocalEmployee({ projectFirmId, name }) {
  const projectFirm = await projectFirmsRepo.getById(projectFirmId);

  if (!projectFirm) {
    throw new Error('Projektfirma wurde nicht gefunden.');
  }

  return projectLocalFirmEmployeesRepo.createEmployee({
    projectFirmId,
    name,
  });
}

export async function updateProjectLocalEmployee({ projectFirmId, employeeId, name }) {
  const [projectFirm, employee] = await Promise.all([
    projectFirmsRepo.getById(projectFirmId),
    projectLocalFirmEmployeesRepo.getById(employeeId),
  ]);

  if (!projectFirm) {
    throw new Error('Projektfirma wurde nicht gefunden.');
  }
  if (!employee) {
    throw new Error('Projektinterner Mitarbeiter wurde nicht gefunden.');
  }
  if (String(employee.project_firm_id) !== String(projectFirmId)) {
    throw new Error('Projektinterner Mitarbeiter gehoert nicht zu dieser Projektfirma.');
  }

  return projectLocalFirmEmployeesRepo.updateEmployee({
    employeeId,
    name,
  });
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
