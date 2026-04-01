import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";

function nowIso() {
  return new Date().toISOString();
}

function nextMeetingIndex(db, projectId) {
  const indices = db.meetings
    .filter((m) => String(m.project_id) === String(projectId))
    .map((m) => Number(m.meeting_index) || 0);
  return indices.length ? Math.max(...indices) + 1 : 1;
}

export function getMeetingById(meetingId) {
  const db = readDb();
  return db.meetings.find((m) => String(m.id) === String(meetingId)) || null;
}

export function listByProject(projectId) {
  const db = readDb();
  return db.meetings
    .filter((m) => String(m.project_id) === String(projectId))
    .sort((a, b) => (b.meeting_index || 0) - (a.meeting_index || 0));
}

export function getOpenMeetingByProject(projectId) {
  const db = readDb();
  return (
    db.meetings
      .filter((m) => String(m.project_id) === String(projectId) && !m.is_closed)
      .sort((a, b) => (b.meeting_index || 0) - (a.meeting_index || 0))[0] || null
  );
}

export function getLastClosedMeetingByProject(projectId) {
  const db = readDb();
  return (
    db.meetings
      .filter((m) => String(m.project_id) === String(projectId) && !!m.is_closed)
      .sort((a, b) => (b.meeting_index || 0) - (a.meeting_index || 0))[0] || null
  );
}

export function createMeeting({ projectId, title = "" }) {
  const db = readDb();
  const existingOpen = getOpenMeetingByProject(projectId);
  if (existingOpen) return existingOpen;

  const id = createId();
  const meeting_index = nextMeetingIndex(db, projectId);
  const now = nowIso();
  const meeting = {
    id,
    project_id: projectId,
    meeting_index,
    title,
    is_closed: 0,
    created_at: now,
    updated_at: now,
  };
  db.meetings = [...db.meetings, meeting];
  writeDb(db);
  return meeting;
}

export function closeMeeting(meetingId, { pdfShowAmpel = null, todoSnapshotJson = null, nextMeeting = null } = {}) {
  const db = readDb();
  let result = null;
  db.meetings = db.meetings.map((m) => {
    if (String(m.id) !== String(meetingId)) return m;
    const now = nowIso();
    result = {
      ...m,
      is_closed: 1,
      pdf_show_ampel: pdfShowAmpel,
      todo_snapshot_json: todoSnapshotJson,
      next_meeting_enabled: nextMeeting?.enabled ?? null,
      next_meeting_date: nextMeeting?.date ?? null,
      next_meeting_time: nextMeeting?.time ?? null,
      next_meeting_place: nextMeeting?.place ?? null,
      next_meeting_extra: nextMeeting?.extra ?? null,
      updated_at: now,
    };
    return result;
  });
  writeDb(db);
  return result;
}
