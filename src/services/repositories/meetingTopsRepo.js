import { readDb, writeDb } from "../storage/localDb.js";
import { nowIso } from "../utils/time.js";
import { normalizeTopLongtextForStorage } from "../tops/topTextLimits.js";

// Helper to ensure optional flags exist.
function ensureDefaults(row) {
  return {
    status: "offen",
    due_date: null,
    longtext: null,
    is_carried_over: 0,
    is_task: 0,
    is_decision: 0,
    completed_in_meeting_id: null,
    is_important: 0,
    is_touched: 0,
    responsible_kind: null,
    responsible_id: null,
    responsible_label: null,
    contact_kind: null,
    contact_person_id: null,
    contact_label: null,
    frozen_at: null,
    frozen_title: null,
    frozen_is_hidden: null,
    frozen_parent_top_id: null,
    frozen_level: null,
    frozen_number: null,
    frozen_display_number: null,
    frozen_ampel_color: null,
    frozen_ampel_reason: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    ...row,
  };
}

export function getMeetingTop(meetingId, topId) {
  const db = readDb();
  return db.meetingTops.find(
    (mt) => String(mt.meeting_id) === String(meetingId) && String(mt.top_id) === String(topId),
  ) || null;
}

export function attachTopToMeeting(input) {
  const db = readDb();
  const normalizedLongtext = normalizeTopLongtextForStorage(input.longtext);
  const row = ensureDefaults({
    meeting_id: input.meetingId,
    top_id: input.topId,
    status: input.status ?? "offen",
    due_date: input.dueDate ?? null,
    longtext: normalizedLongtext,
    is_carried_over: input.isCarriedOver ? 1 : 0,
    completed_in_meeting_id: input.completed_in_meeting_id ?? null,
    is_important: input.is_important ? 1 : 0,
    is_touched: input.is_touched ? 1 : 0,
    is_task: input.is_task ? 1 : 0,
    is_decision: input.is_decision ? 1 : 0,
    responsible_kind: input.responsible_kind ?? null,
    responsible_id: input.responsible_id ?? null,
    responsible_label: input.responsible_label ?? null,
    contact_kind: input.contact_kind ?? null,
    contact_person_id: input.contact_person_id ?? null,
    contact_label: input.contact_label ?? null,
  });
  const existing = getMeetingTop(input.meetingId, input.topId);
  if (existing) return existing;
  db.meetingTops = [...db.meetingTops, row];
  writeDb(db);
  return row;
}

export function updateMeetingTop({
  meetingId,
  topId,
  status,
  dueDate,
  longtext,
  completed_in_meeting_id = undefined,
  is_important = undefined,
  is_touched = undefined,
  is_task = undefined,
  is_decision = undefined,
  responsible_kind = undefined,
  responsible_id = undefined,
  responsible_label = undefined,
  contact_kind = undefined,
  contact_person_id = undefined,
  contact_label = undefined,
  frozen_at = undefined,
  frozen_title = undefined,
  frozen_is_hidden = undefined,
  frozen_parent_top_id = undefined,
  frozen_level = undefined,
  frozen_number = undefined,
  frozen_display_number = undefined,
  frozen_ampel_color = undefined,
  frozen_ampel_reason = undefined,
}) {
  const db = readDb();
  const normalizedLongtext = longtext === undefined ? undefined : normalizeTopLongtextForStorage(longtext);
  let updated = null;
  db.meetingTops = db.meetingTops.map((mt) => {
    if (String(mt.meeting_id) !== String(meetingId) || String(mt.top_id) !== String(topId)) return mt;
    updated = {
      ...mt,
      status: status ?? mt.status,
      due_date: dueDate === undefined ? mt.due_date : dueDate,
      longtext: normalizedLongtext === undefined ? mt.longtext : normalizedLongtext,
      completed_in_meeting_id:
        completed_in_meeting_id === undefined ? mt.completed_in_meeting_id : completed_in_meeting_id,
      is_important: is_important === undefined ? mt.is_important : is_important ? 1 : 0,
      is_touched: is_touched === undefined ? mt.is_touched : is_touched ? 1 : 0,
      is_task: is_task === undefined ? mt.is_task : is_task ? 1 : 0,
      is_decision: is_decision === undefined ? mt.is_decision : is_decision ? 1 : 0,
      responsible_kind: responsible_kind === undefined ? mt.responsible_kind : responsible_kind,
      responsible_id: responsible_id === undefined ? mt.responsible_id : responsible_id,
      responsible_label: responsible_label === undefined ? mt.responsible_label : responsible_label,
      contact_kind: contact_kind === undefined ? mt.contact_kind : contact_kind,
      contact_person_id: contact_person_id === undefined ? mt.contact_person_id : contact_person_id,
      contact_label: contact_label === undefined ? mt.contact_label : contact_label,
      frozen_at: frozen_at === undefined ? mt.frozen_at : frozen_at,
      frozen_title: frozen_title === undefined ? mt.frozen_title : frozen_title,
      frozen_is_hidden: frozen_is_hidden === undefined ? mt.frozen_is_hidden : frozen_is_hidden,
      frozen_parent_top_id:
        frozen_parent_top_id === undefined ? mt.frozen_parent_top_id : frozen_parent_top_id,
      frozen_level: frozen_level === undefined ? mt.frozen_level : frozen_level,
      frozen_number: frozen_number === undefined ? mt.frozen_number : frozen_number,
      frozen_display_number:
        frozen_display_number === undefined ? mt.frozen_display_number : frozen_display_number,
      frozen_ampel_color: frozen_ampel_color === undefined ? mt.frozen_ampel_color : frozen_ampel_color,
      frozen_ampel_reason: frozen_ampel_reason === undefined ? mt.frozen_ampel_reason : frozen_ampel_reason,
      updated_at: nowIso(),
    };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function listJoinedByMeeting(meetingId) {
  const db = readDb();
  return db.meetingTops
    .filter((mt) => String(mt.meeting_id) === String(meetingId))
    .map((mt) => {
      const top = db.tops.find((t) => String(t.id) === String(mt.top_id)) || {};
      return {
        ...mt,
        id: top.id,
        project_id: top.project_id,
        parent_top_id: top.parent_top_id,
        level: top.level,
        number: top.number,
        title: top.title,
        is_hidden: top.is_hidden,
        is_trashed: top.is_trashed,
        removed_at: top.removed_at,
        top_created_at: top.created_at,
      };
    })
    .filter((row) => !row.removed_at && !(row.is_trashed));
}

export function listLatestByProject(projectId) {
  const db = readDb();
  const latestByTop = new Map();
  db.meetingTops
    .filter((mt) => {
      const top = db.tops.find((t) => String(t.id) === String(mt.top_id));
      return top && String(top.project_id) === String(projectId) && !top.removed_at && !top.is_trashed;
    })
    .forEach((mt) => {
      const prev = latestByTop.get(mt.top_id);
      if (!prev || (prev.updated_at || "") < (mt.updated_at || "")) {
        latestByTop.set(mt.top_id, mt);
      }
    });

  return Array.from(latestByTop.values()).map((mt) => {
    const top = db.tops.find((t) => String(t.id) === String(mt.top_id)) || {};
    return {
      ...mt,
      id: top.id,
      project_id: top.project_id,
      parent_top_id: top.parent_top_id,
      level: top.level,
      number: top.number,
      title: top.title,
      is_hidden: top.is_hidden,
      is_trashed: top.is_trashed,
      removed_at: top.removed_at,
      top_created_at: top.created_at,
    };
  });
}

export function deleteByTopId(topId) {
  const db = readDb();
  db.meetingTops = db.meetingTops.filter((mt) => String(mt.top_id) !== String(topId));
  writeDb(db);
  return { deleted: true };
}

export function carryOverFromMeeting(fromMeetingId, toMeetingId, { skipIds = new Set() } = {}) {
  const db = readDb();
  const now = nowIso();
  const sourceRows = listJoinedByMeeting(fromMeetingId);
  const toInsert = [];

  sourceRows.forEach((row) => {
    if (skipIds.has(row.id)) return;
    if (row.is_hidden) return;
    toInsert.push(
      ensureDefaults({
        meeting_id: toMeetingId,
        top_id: row.id,
        status: row.status,
        due_date: row.due_date,
        longtext: row.longtext,
        is_carried_over: 1,
        is_task: row.is_task,
        is_decision: row.is_decision,
        is_touched: 0,
        is_important: row.is_important,
        responsible_kind: row.responsible_kind,
        responsible_id: row.responsible_id,
        responsible_label: row.responsible_label,
        contact_kind: row.contact_kind,
        contact_person_id: row.contact_person_id,
        contact_label: row.contact_label,
        completed_in_meeting_id: row.completed_in_meeting_id,
        created_at: now,
        updated_at: now,
      }),
    );
  });

  const existingKeys = new Set(db.meetingTops.map((mt) => `${mt.meeting_id}::${mt.top_id}`));
  const merged = [...db.meetingTops];
  toInsert.forEach((row) => {
    const key = `${row.meeting_id}::${row.top_id}`;
    if (!existingKeys.has(key)) {
      merged.push(row);
      existingKeys.add(key);
    }
  });
  db.meetingTops = merged;
  writeDb(db);
  return { inserted: toInsert.length };
}
