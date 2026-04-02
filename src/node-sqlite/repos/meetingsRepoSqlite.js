import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

function getNextIndex(db, projectId) {
  const row = db.prepare(`SELECT COALESCE(MAX(meeting_index),0)+1 AS next FROM meetings WHERE project_id = ?`).get(projectId);
  return row.next;
}

function buildMeetingCreatedAt(date) {
  const val = (date || "").toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return `${val}T12:00:00.000Z`;
  }
  return nowIso();
}

export function getMeetingById(meetingId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM meetings WHERE id = ?`).get(meetingId) || null;
}

export function listByProject(projectId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM meetings WHERE project_id = ? ORDER BY meeting_index DESC`)
    .all(projectId);
}

export function getOpenMeetingByProject(projectId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM meetings WHERE project_id = ? AND is_closed = 0 ORDER BY meeting_index DESC LIMIT 1`)
    .get(projectId) || null;
}

export function getLastClosedMeetingByProject(projectId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM meetings WHERE project_id = ? AND is_closed = 1 ORDER BY meeting_index DESC LIMIT 1`)
    .get(projectId) || null;
}

export function createMeeting({ projectId, title, date, protocolLabel }) {
  const db = getDb();
  const open = getOpenMeetingByProject(projectId);
  if (open) return open;
  const id = createId();
  const now = nowIso();
  const idx = getNextIndex(db, projectId);
  const createdAt = buildMeetingCreatedAt(date);
  db.prepare(
    `INSERT INTO meetings (id, project_id, meeting_index, title, protocol_label, is_closed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
  ).run(id, projectId, idx, title || null, protocolLabel || "Protokoll", createdAt, now);
  return getMeetingById(id);
}

export function closeMeeting(meetingId, { pdfShowAmpel = null, todoSnapshotJson = null, nextMeeting = null } = {}) {
  const db = getDb();
  const now = nowIso();
  const info = db
    .prepare(
      `UPDATE meetings SET
        is_closed = 1,
        pdf_show_ampel = @pdfShowAmpel,
        todo_snapshot_json = @todoSnapshotJson,
        next_meeting_enabled = @nextMeetingEnabled,
        next_meeting_date = @nextMeetingDate,
        next_meeting_time = @nextMeetingTime,
        next_meeting_place = @nextMeetingPlace,
        next_meeting_extra = @nextMeetingExtra,
        updated_at = @now
      WHERE id = @id AND is_closed = 0`,
    )
    .run({
      id: meetingId,
      pdfShowAmpel,
      todoSnapshotJson,
      nextMeetingEnabled: nextMeeting?.enabled ?? null,
      nextMeetingDate: nextMeeting?.date ?? null,
      nextMeetingTime: nextMeeting?.time ?? null,
      nextMeetingPlace: nextMeeting?.place ?? null,
      nextMeetingExtra: nextMeeting?.extra ?? null,
      now,
    });
  return { changed: info.changes, meeting: getMeetingById(meetingId) };
}

export function updateMeetingTitle({ meetingId, title }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE meetings SET title = ?, updated_at = ? WHERE id = ?`).run(title || null, now, meetingId);
  return getMeetingById(meetingId);
}

export function updateMeetingLabel({ meetingId, protocolLabel }) {
  const db = getDb();
  const now = nowIso();
  db.prepare(`UPDATE meetings SET protocol_label = ?, updated_at = ? WHERE id = ?`).run(protocolLabel || "Protokoll", now, meetingId);
  return getMeetingById(meetingId);
}
