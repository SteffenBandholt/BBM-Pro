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

export function createFirm({ projectId, name, shortLabel = "" }) {
  const db = readDb();
  const now = nowIso();
  const firm = {
    id: createId(),
    project_id: projectId,
    name: name?.trim() || "Firma",
    short_label: shortLabel?.trim() || name?.trim() || "Firma",
    removed_at: null,
    created_at: now,
    updated_at: now,
  };
  db.projectFirms = [...db.projectFirms, firm];
  writeDb(db);
  return firm;
}

export function ensureSampleFirms(projectId) {
  const existing = listByProject(projectId);
  if (existing.length > 0) return existing;
  createFirm({ projectId, name: "Musterbau GmbH", shortLabel: "Musterbau" });
  createFirm({ projectId, name: "Planung AG", shortLabel: "Planung" });
  return listByProject(projectId);
}
