import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { normalizeTopTitleForStorage } from "../tops/topTextLimits.js";

function nowIso() {
  return new Date().toISOString();
}

export function getTopById(topId) {
  const db = readDb();
  return db.tops.find((t) => String(t.id) === String(topId)) || null;
}

export function hasChildren(topId) {
  const db = readDb();
  return db.tops.some((t) => String(t.parent_top_id) === String(topId) && !t.removed_at);
}

export function getNextNumber(projectId, parentTopId) {
  const db = readDb();
  const siblings = db.tops.filter(
    (t) =>
      String(t.project_id) === String(projectId) &&
      (t.parent_top_id ? String(t.parent_top_id) : null) === (parentTopId ? String(parentTopId) : null) &&
      !t.removed_at,
  );
  const numbers = siblings.map((s) => Number(s.number) || 0);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

export function createTop({ projectId, parentTopId = null, level, number, title }) {
  const db = readDb();
  const id = createId();
  const now = nowIso();
  const normalizedTitle = normalizeTopTitleForStorage(title);
  const top = {
    id,
    project_id: projectId,
    parent_top_id: parentTopId || null,
    level,
    number,
    title: normalizedTitle || "(ohne Bezeichnung)",
    is_hidden: 0,
    is_trashed: 0,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };
  db.tops = [...db.tops, top];
  writeDb(db);
  return top;
}

export function updateTitle({ topId, title }) {
  const db = readDb();
  const normalizedTitle = normalizeTopTitleForStorage(title);
  let updated = null;
  db.tops = db.tops.map((t) => {
    if (String(t.id) !== String(topId)) return t;
    updated = { ...t, title: normalizedTitle || t.title, updated_at: nowIso() };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function setHidden({ topId, isHidden }) {
  const db = readDb();
  let updated = null;
  db.tops = db.tops.map((t) => {
    if (String(t.id) !== String(topId)) return t;
    updated = { ...t, is_hidden: isHidden ? 1 : 0, updated_at: nowIso() };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function moveTop({ topId, targetParentId, newLevel, newNumber }) {
  const db = readDb();
  let updated = null;
  db.tops = db.tops.map((t) => {
    if (String(t.id) !== String(topId)) return t;
    updated = {
      ...t,
      parent_top_id: targetParentId || null,
      level: newLevel,
      number: newNumber,
      updated_at: nowIso(),
    };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function softDeleteTop({ topId }) {
  const db = readDb();
  let updated = null;
  db.tops = db.tops.map((t) => {
    if (String(t.id) !== String(topId)) return t;
    const now = nowIso();
    updated = { ...t, removed_at: now, updated_at: now };
    return updated;
  });
  writeDb(db);
  return updated;
}
