import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";

export function listMeetingParticipants(meetingId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM meeting_participants WHERE meeting_id = ? ORDER BY kind, firm_id, person_id`,
    )
    .all(meetingId);
}

export function setMeetingParticipant({ meetingId, firmId = null, personId = null, is_present, is_in_distribution }) {
  const db = getDb();
  const now = nowIso();
  const kind = firmId ? "firm" : "project_person";
  const keyId = firmId ?? personId;
  const existing = db
    .prepare(
      `SELECT * FROM meeting_participants WHERE meeting_id = ? AND kind = ? AND COALESCE(firm_id, person_id) = ?`,
    )
    .get(meetingId, kind, keyId);
  if (existing) {
    db.prepare(
      `UPDATE meeting_participants SET is_present = ?, is_in_distribution = ?, updated_at = ? WHERE meeting_id = ? AND kind = ? AND COALESCE(firm_id, person_id) = ?`,
    ).run(is_present ? 1 : 0, is_in_distribution ? 1 : 0, now, meetingId, kind, keyId);
  } else {
    db.prepare(
      `INSERT INTO meeting_participants (meeting_id, kind, firm_id, person_id, is_present, is_in_distribution, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(meetingId, kind, firmId, personId, is_present ? 1 : 0, is_in_distribution ? 1 : 0, now, now);
  }
  return { ok: true };
}

export function seedFromProject(meetingId, projectId) {
  const db = getDb();
  const firms = db
    .prepare(`SELECT id FROM project_firms WHERE project_id = ? AND removed_at IS NULL`)
    .all(projectId);
  const existing = db
    .prepare(`SELECT COALESCE(firm_id, person_id) AS id FROM meeting_participants WHERE meeting_id = ?`)
    .all(meetingId)
    .map((r) => String(r.id));
  const now = nowIso();
  const tx = db.transaction(() => {
    firms.forEach((f) => {
      if (existing.includes(String(f.id))) return;
      db.prepare(
        `INSERT INTO meeting_participants (meeting_id, kind, firm_id, person_id, is_present, is_in_distribution, created_at, updated_at)
         VALUES (?, 'firm', ?, NULL, 0, 0, ?, ?)`,
      ).run(meetingId, f.id, now, now);
    });
  });
  tx();
  return { inserted: firms.length };
}
