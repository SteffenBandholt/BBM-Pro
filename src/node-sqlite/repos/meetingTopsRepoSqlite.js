import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { normalizeTopLongtextForStorage } from "../../services/tops/topTextLimits.js";

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
  const db = getDb();
  return db
    .prepare(
      `SELECT mt.*, t.project_id, t.parent_top_id, t.level, t.number, t.title, t.is_hidden, t.is_trashed, t.removed_at, t.created_at AS top_created_at
       FROM meeting_tops mt
       JOIN tops t ON t.id = mt.top_id
       WHERE mt.meeting_id = ? AND mt.top_id = ?`,
    )
    .get(meetingId, topId) || null;
}

export function attachTopToMeeting(input) {
  const db = getDb();
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
  db.prepare(
    `INSERT OR IGNORE INTO meeting_tops
    (meeting_id, top_id, status, due_date, longtext, is_carried_over, is_task, is_decision, completed_in_meeting_id,
     is_important, is_touched, responsible_kind, responsible_id, responsible_label,
     contact_kind, contact_person_id, contact_label, frozen_at, frozen_title, frozen_is_hidden,
     frozen_parent_top_id, frozen_level, frozen_number, frozen_display_number, frozen_ampel_color, frozen_ampel_reason,
     created_at, updated_at)
     VALUES (@meeting_id,@top_id,@status,@due_date,@longtext,@is_carried_over,@is_task,@is_decision,@completed_in_meeting_id,
     @is_important,@is_touched,@responsible_kind,@responsible_id,@responsible_label,
     @contact_kind,@contact_person_id,@contact_label,@frozen_at,@frozen_title,@frozen_is_hidden,
     @frozen_parent_top_id,@frozen_level,@frozen_number,@frozen_display_number,@frozen_ampel_color,@frozen_ampel_reason,
     @created_at,@updated_at)`
  ).run(row);
  return getMeetingTop(input.meetingId, input.topId);
}

export function updateMeetingTop(update) {
  const db = getDb();
  const now = nowIso();
  const normalizedLongtext =
    update.longtext === undefined ? undefined : normalizeTopLongtextForStorage(update.longtext);
  const nextUpdate = normalizedLongtext === undefined ? update : { ...update, longtext: normalizedLongtext };
  const sets = [];
  const vals = [];
  const fields = [
    "status",
    "due_date",
    "longtext",
    "completed_in_meeting_id",
    "is_important",
    "is_touched",
    "is_task",
    "is_decision",
    "responsible_kind",
    "responsible_id",
    "responsible_label",
    "contact_kind",
    "contact_person_id",
    "contact_label",
    "frozen_at",
    "frozen_title",
    "frozen_is_hidden",
    "frozen_parent_top_id",
    "frozen_level",
    "frozen_number",
    "frozen_display_number",
    "frozen_ampel_color",
    "frozen_ampel_reason",
  ];
  fields.forEach((f) => {
    if (nextUpdate[f] !== undefined) {
      sets.push(`${f} = ?`);
      vals.push(nextUpdate[f]);
    }
  });
  sets.push(`updated_at = ?`);
  vals.push(now, nextUpdate.meetingId, nextUpdate.topId);
  const sql = `UPDATE meeting_tops SET ${sets.join(", ")} WHERE meeting_id = ? AND top_id = ?`;
  const info = db.prepare(sql).run(...vals);
  return { changed: info.changes, row: getMeetingTop(nextUpdate.meetingId, nextUpdate.topId) };
}

export function listJoinedByMeeting(meetingId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT
        t.id,
        t.project_id,
        t.parent_top_id,
        t.level,
        t.number,
        t.title,
        t.is_hidden,
        t.is_trashed,
        t.removed_at,
        t.created_at AS top_created_at,
        mt.*
      FROM meeting_tops mt
      JOIN tops t ON t.id = mt.top_id
      WHERE mt.meeting_id = ?
      AND (t.removed_at IS NULL)
      AND (t.is_trashed = 0)`
    )
    .all(meetingId);
}

export function deleteByTopId(topId) {
  const db = getDb();
  const info = db.prepare(`DELETE FROM meeting_tops WHERE top_id = ?`).run(topId);
  return { deleted: info.changes };
}

export function carryOverFromMeeting(fromMeetingId, toMeetingId, { skipIds = new Set() } = {}) {
  const db = getDb();
  const rows = listJoinedByMeeting(fromMeetingId).filter((r) => !skipIds.has(r.id) && !r.is_hidden);
  const now = nowIso();
  const tx = db.transaction(() => {
    rows.forEach((row) => {
      const payload = ensureDefaults({
        meeting_id: toMeetingId,
        top_id: row.id,
        status: row.status,
        due_date: row.due_date,
        longtext: row.longtext,
        is_carried_over: 1,
        is_task: row.is_task,
        is_decision: row.is_decision,
        is_important: row.is_important,
        is_touched: row.is_touched,
        responsible_kind: row.responsible_kind,
        responsible_id: row.responsible_id,
        responsible_label: row.responsible_label,
        contact_kind: row.contact_kind,
        contact_person_id: row.contact_person_id,
        contact_label: row.contact_label,
        created_at: now,
        updated_at: now,
      });
      db.prepare(
        `INSERT OR REPLACE INTO meeting_tops
        (meeting_id, top_id, status, due_date, longtext, is_carried_over, is_task, is_decision, completed_in_meeting_id,
         is_important, is_touched, responsible_kind, responsible_id, responsible_label,
         contact_kind, contact_person_id, contact_label, frozen_at, frozen_title, frozen_is_hidden,
         frozen_parent_top_id, frozen_level, frozen_number, frozen_display_number, frozen_ampel_color, frozen_ampel_reason,
         created_at, updated_at)
         VALUES (@meeting_id,@top_id,@status,@due_date,@longtext,@is_carried_over,@is_task,@is_decision,@completed_in_meeting_id,
         @is_important,@is_touched,@responsible_kind,@responsible_id,@responsible_label,
         @contact_kind,@contact_person_id,@contact_label,@frozen_at,@frozen_title,@frozen_is_hidden,
         @frozen_parent_top_id,@frozen_level,@frozen_number,@frozen_display_number,@frozen_ampel_color,@frozen_ampel_reason,
         @created_at,@updated_at)`
      ).run(payload);
    });
  });
  tx();
  return { inserted: rows.length };
}
