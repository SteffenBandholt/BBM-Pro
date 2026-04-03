import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listFirms() {
  const db = readDb();
  const firms = db.globalFirms || [];
  return firms
    .filter((firm) => !firm.removed_at)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getById(firmId) {
  const db = readDb();
  const firms = db.globalFirms || [];
  return firms.find((firm) => String(firm.id) === String(firmId) && !firm.removed_at) || null;
}

export function createFirm({ name, shortLabel = "" }) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) {
    throw new Error("Firmenname fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  const firm = {
    id: createId(),
    name: trimmedName,
    short_label: String(shortLabel || "").trim() || trimmedName,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.globalFirms = [...(db.globalFirms || []), firm];
  writeDb(db);
  return firm;
}
