import { getRepos } from '../../../services/repositories/index.js';

const { globalFirmsRepo, globalFirmEmployeesRepo } = getRepos();

function mapEmployeeToUi(employee) {
  return {
    id: employee.id,
    name: employee.name || 'Mitarbeiter',
  };
}

function mapFirmToUi(firm) {
  return {
    id: firm.id,
    name: firm.name || 'Firma',
    shortLabel: firm.short_label || firm.shortLabel || '',
    employees: (firm.employees || []).map(mapEmployeeToUi),
  };
}

export async function listFirms() {
  const rows = await globalFirmsRepo.listFirms();
  const firmsWithEmployees = await Promise.all(
    rows.map(async (firm) => ({
      ...firm,
      employees: await globalFirmEmployeesRepo.listByFirm(firm.id),
    })),
  );
  return firmsWithEmployees.map(mapFirmToUi);
}

export async function createFirm(input) {
  const row = await globalFirmsRepo.createFirm(input);
  return mapFirmToUi(row);
}

export async function createFirmEmployee(input) {
  const row = await globalFirmEmployeesRepo.createEmployee(input);
  return mapEmployeeToUi(row);
}
