import { readDb, writeDb } from "../storage/localDb.js";
import { nowIso } from "../utils/time.js";
import { listByProject as listFirmsByProject } from "./projectFirmsRepo.js";

function key(meetingId, firmId) {
  return `${meetingId}::firm::${firmId}`;
}

export function listMeetingParticipants(meetingId) {
  const db = readDb();
  return db.meetingParticipants
    .filter((p) => String(p.meeting_id) === String(meetingId))
    .map((p) => ({ ...p }));
}

export function setMeetingParticipant({ meetingId, firmId, is_present, is_in_distribution }) {
  const db = readDb();
  const k = key(meetingId, firmId);
  const now = nowIso();
  let found = false;
  db.meetingParticipants = db.meetingParticipants.map((p) => {
    if (key(p.meeting_id, p.firm_id) !== k) return p;
    found = true;
    return {
      ...p,
      is_present: is_present ? 1 : 0,
      is_in_distribution: is_in_distribution ? 1 : 0,
      updated_at: now,
    };
  });
  if (!found) {
    db.meetingParticipants.push({
      meeting_id: meetingId,
      kind: "firm",
      firm_id: firmId,
      is_present: is_present ? 1 : 0,
      is_in_distribution: is_in_distribution ? 1 : 0,
      created_at: now,
      updated_at: now,
    });
  }
  writeDb(db);
  return { ok: true };
}

export function seedFromProject(meetingId, projectId) {
  const firms = listFirmsByProject(projectId);
  const db = readDb();
  const existingKeys = new Set(db.meetingParticipants.map((p) => key(p.meeting_id, p.firm_id)));
  const now = nowIso();
  const toInsert = firms.filter((f) => !existingKeys.has(key(meetingId, f.id)));
  if (!toInsert.length) return { inserted: 0 };
  db.meetingParticipants = [
    ...db.meetingParticipants,
    ...toInsert.map((f) => ({
      meeting_id: meetingId,
      kind: "firm",
      firm_id: f.id,
      is_present: 0,
      is_in_distribution: 0,
      created_at: now,
      updated_at: now,
    })),
  ];
  writeDb(db);
  return { inserted: toInsert.length };
}
