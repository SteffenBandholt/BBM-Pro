import { getDb } from "../client.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

function ensureFirmsSchemaReady() {
  runMigrations();
}

export function listFirms() {
  ensureFirmsSchemaReady();
  const db = getDb();
  return db
    .prepare(`SELECT * FROM global_firms WHERE removed_at IS NULL ORDER BY name`)
    .all();
}

export function getById(firmId) {
  ensureFirmsSchemaReady();
  const db = getDb();
  return db.prepare(`SELECT * FROM global_firms WHERE id = ? AND removed_at IS NULL`).get(firmId) || null;
}

export function createFirm({ name, shortLabel = "" }) {
  ensureFirmsSchemaReady();
  const trimmedName = String(name || "").trim();
  if (!trimmedName) {
    throw new Error("Firmenname fehlt.");
  }

  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO global_firms (id, name, short_label, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
  ).run(id, trimmedName, String(shortLabel || "").trim() || trimmedName, now, now);
  return getById(id);
}
