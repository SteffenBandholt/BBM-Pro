import { getRepos } from '../../../services/repositories/index.js';

const { globalFirmsRepo } = getRepos();

function mapFirmToUi(firm) {
  return {
    id: firm.id,
    name: firm.name || 'Firma',
    shortLabel: firm.short_label || firm.shortLabel || '',
    employees: [],
  };
}

export async function listFirms() {
  const rows = await globalFirmsRepo.listFirms();
  return rows.map(mapFirmToUi);
}

export async function createFirm(input) {
  const row = await globalFirmsRepo.createFirm(input);
  return mapFirmToUi(row);
}
