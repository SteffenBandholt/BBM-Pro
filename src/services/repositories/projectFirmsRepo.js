import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByProject(projectId) {
  const db = readDb();
  const firms = db.projectFirms || [];
  return firms
    .filter((f) => String(f.project_id) === String(projectId) && !f.removed_at)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getById(firmId) {
  const db = readDb();
  const firms = db.projectFirms || [];
  return firms.find((f) => String(f.id) === String(firmId) && !f.removed_at) || null;
}

export function createFirm({ projectId, name, shortLabel = "", globalFirmId = null }) {
  const db = readDb();
  const now = nowIso();
  const firm = {
    id: createId(),
    project_id: projectId,
    name: name?.trim() || "Firma",
    short_label: shortLabel?.trim() || name?.trim() || "Firma",
    global_firm_id: globalFirmId || null,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };
  db.projectFirms = [...(db.projectFirms || []), firm];
  writeDb(db);
  return firm;
}

export function updateFirm({ firmId, name, shortLabel = undefined }) {
  const trimmedName = String(name || "").trim();
  if (!firmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Firmenname fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  let updatedFirm = null;

  db.projectFirms = (db.projectFirms || []).map((firm) => {
    if (String(firm.id) !== String(firmId) || firm.removed_at) {
      return firm;
    }

    updatedFirm = {
      ...firm,
      name: trimmedName,
      short_label: shortLabel === undefined ? firm.short_label : String(shortLabel || "").trim() || trimmedName,
      updated_at: now,
    };
    return updatedFirm;
  });

  if (!updatedFirm) {
    throw new Error("Projektfirma wurde nicht gefunden.");
  }

  writeDb(db);
  return updatedFirm;
}

export function removeFirm(firmId) {
  if (!firmId) {
    throw new Error("Projektfirma fehlt.");
  }

  const db = readDb();
  const currentFirm = (db.projectFirms || []).find((firm) => String(firm.id) === String(firmId) && !firm.removed_at) || null;
  if (!currentFirm) {
    throw new Error("Projektfirma wurde nicht gefunden.");
  }

  const hasProjectLocalEmployees = (db.projectLocalFirmEmployees || []).some(
    (employee) => String(employee.project_firm_id) === String(firmId) && !employee.removed_at,
  );
  if (hasProjectLocalEmployees) {
    throw new Error("Projektfirma kann nicht geloescht werden, solange noch projektinterne Mitarbeiter zugeordnet sind.");
  }

  const now = nowIso();
  let updatedFirm = null;

  db.projectFirms = (db.projectFirms || []).map((firm) => {
    if (String(firm.id) !== String(firmId) || firm.removed_at) {
      return firm;
    }

    updatedFirm = {
      ...firm,
      removed_at: now,
      updated_at: now,
    };
    return updatedFirm;
  });

  writeDb(db);
  return updatedFirm;
}
