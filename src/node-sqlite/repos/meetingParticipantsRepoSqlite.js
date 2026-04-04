import { getDb } from "../client.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";

function ensureMeetingParticipantsSchemaReady() {
  runMigrations();
}

export function listMeetingParticipants(meetingId) {
  ensureMeetingParticipantsSchemaReady();
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM meeting_person_participants WHERE meeting_id = ? ORDER BY firm_name, person_name`,
    )
    .all(meetingId);
}

export function setMeetingParticipant({
  meetingId,
  personKind,
  personId,
  firmId,
  personName,
  firmName,
  is_present,
  is_in_distribution,
}) {
  ensureMeetingParticipantsSchemaReady();
  const db = getDb();
  const now = nowIso();
  const existing = db
    .prepare(
      `SELECT * FROM meeting_person_participants WHERE meeting_id = ? AND person_kind = ? AND person_id = ?`,
    )
    .get(meetingId, personKind, personId);
  if (existing) {
    db.prepare(
      `UPDATE meeting_person_participants
       SET firm_id = ?, person_name = ?, firm_name = ?, is_present = ?, is_in_distribution = ?, updated_at = ?
       WHERE meeting_id = ? AND person_kind = ? AND person_id = ?`,
    ).run(firmId, personName, firmName || "", is_present ? 1 : 0, is_in_distribution ? 1 : 0, now, meetingId, personKind, personId);
  } else {
    db.prepare(
      `INSERT INTO meeting_person_participants
       (meeting_id, person_kind, person_id, firm_id, person_name, firm_name, is_present, is_in_distribution, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(meetingId, personKind, personId, firmId, personName, firmName || "", is_present ? 1 : 0, is_in_distribution ? 1 : 0, now, now);
  }
  return { ok: true };
}

export function removeMeetingParticipant({ meetingId, personKind, personId }) {
  ensureMeetingParticipantsSchemaReady();
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM meeting_person_participants WHERE meeting_id = ? AND person_kind = ? AND person_id = ?`)
    .run(meetingId, personKind, personId);
  return { removed: result.changes };
}

export function replaceMeetingParticipants(meetingId, participants) {
  ensureMeetingParticipantsSchemaReady();
  const db = getDb();
  const now = nowIso();
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM meeting_person_participants WHERE meeting_id = ?`).run(meetingId);

    const insert = db.prepare(
      `INSERT INTO meeting_person_participants
       (meeting_id, person_kind, person_id, firm_id, person_name, firm_name, is_present, is_in_distribution, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    (participants || []).forEach((participant) => {
      insert.run(
        meetingId,
        participant.personKind,
        participant.personId,
        participant.firmId,
        participant.personName,
        participant.firmName || "",
        participant.is_present ? 1 : 0,
        participant.is_in_distribution ? 1 : 0,
        now,
        now,
      );
    });
  });
  tx();
  return { inserted: (participants || []).length };
}
