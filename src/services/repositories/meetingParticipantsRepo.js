import { readDb, writeDb } from "../storage/localDb.js";
import { nowIso } from "../utils/time.js";

function key(meetingId, personKind, personId) {
  return `${meetingId}::${personKind}::${personId}`;
}

export function listMeetingParticipants(meetingId) {
  const db = readDb();
  return (db.meetingPersonParticipants || [])
    .filter((p) => String(p.meeting_id) === String(meetingId))
    .map((p) => ({ ...p }));
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
  const db = readDb();
  const k = key(meetingId, personKind, personId);
  const now = nowIso();
  let found = false;
  db.meetingPersonParticipants = (db.meetingPersonParticipants || []).map((p) => {
    if (key(p.meeting_id, p.person_kind, p.person_id) !== k) return p;
    found = true;
    return {
      ...p,
      firm_id: firmId,
      person_name: personName,
      firm_name: firmName || "",
      is_present: is_present ? 1 : 0,
      is_in_distribution: is_in_distribution ? 1 : 0,
      updated_at: now,
    };
  });
  if (!found) {
    db.meetingPersonParticipants = [
      ...(db.meetingPersonParticipants || []),
      {
      meeting_id: meetingId,
      person_kind: personKind,
      person_id: personId,
      firm_id: firmId,
      person_name: personName,
      firm_name: firmName || "",
      is_present: is_present ? 1 : 0,
      is_in_distribution: is_in_distribution ? 1 : 0,
      created_at: now,
      updated_at: now,
      },
    ];
  }
  writeDb(db);
  return { ok: true };
}

export function removeMeetingParticipant({ meetingId, personKind, personId }) {
  const db = readDb();
  const beforeCount = (db.meetingPersonParticipants || []).length;
  db.meetingPersonParticipants = (db.meetingPersonParticipants || []).filter(
    (participant) => key(participant.meeting_id, participant.person_kind, participant.person_id) !== key(meetingId, personKind, personId),
  );
  writeDb(db);
  return { removed: beforeCount - db.meetingPersonParticipants.length };
}

export function replaceMeetingParticipants(meetingId, participants) {
  const db = readDb();
  const now = nowIso();
  const unchangedParticipants = (db.meetingPersonParticipants || []).filter(
    (participant) => String(participant.meeting_id) !== String(meetingId),
  );

  db.meetingPersonParticipants = [
    ...unchangedParticipants,
    ...(participants || []).map((participant) => ({
      meeting_id: meetingId,
      person_kind: participant.personKind,
      person_id: participant.personId,
      firm_id: participant.firmId,
      person_name: participant.personName,
      firm_name: participant.firmName || "",
      is_present: participant.is_present ? 1 : 0,
      is_in_distribution: participant.is_in_distribution ? 1 : 0,
      created_at: now,
      updated_at: now,
    })),
  ];

  writeDb(db);
  return { inserted: (participants || []).length };
}
