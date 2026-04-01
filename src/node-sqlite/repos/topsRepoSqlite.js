import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

export function getTopById(topId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM tops WHERE id = ?`).get(topId) || null;
}

export function hasChildren(topId) {
  const db = getDb();
  const row = db.prepare(`SELECT 1 FROM tops WHERE parent_top_id = ? AND removed_at IS NULL LIMIT 1`).get(topId);
  return !!row;
}

export function getNextNumber(projectId, parentTopId) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COALESCE(MAX(number),0)+1 AS next FROM tops WHERE project_id = ? AND parent_top_id IS ? AND removed_at IS NULL`,
    )
    .get(projectId, parentTopId ?? null);
  return row.next;
}

export function createTop({ projectId, parentTopId = null, level, number, title }) {
  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO tops (id, project_id, parent_top_id, level, number, title, is_hidden, is_trashed, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)`,
  ).run(id, projectId, parentTopId ?? null, level, number, title?.trim() || "(ohne Bezeichnung)", now, now);
  return getTopById(id);
}

export function updateTitle({ topId, title }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE tops SET title = ?, updated_at = ? WHERE id = ?`).run(title?.trim() || "(ohne Bezeichnung)", now, topId);
  return getTopById(topId);
}

export function setHidden({ topId, isHidden }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE tops SET is_hidden = ?, updated_at = ? WHERE id = ?`).run(isHidden ? 1 : 0, now, topId);
  return getTopById(topId);
}

export function moveTop({ topId, targetParentId, newLevel, newNumber }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(
    `UPDATE tops SET parent_top_id = ?, level = ?, number = ?, updated_at = ? WHERE id = ?`,
  ).run(targetParentId ?? null, newLevel, newNumber, now, topId);
  return getTopById(topId);
}

export function softDeleteTop({ topId }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE tops SET removed_at = ?, updated_at = ? WHERE id = ?`).run(now, now, topId);
  return { topId, removed_at: now };
}
