import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByProjectFirm(projectFirmId) {
  const db = readDb();
  const items = db.projectLocalFirmEmployees || [];
  return items
    .filter((item) => String(item.project_firm_id) === String(projectFirmId) && !item.removed_at)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export function getById(employeeId) {
  const db = readDb();
  const items = db.projectLocalFirmEmployees || [];
  return items.find((item) => String(item.id) === String(employeeId) && !item.removed_at) || null;
}

export function createEmployee({ projectFirmId, name }) {
  const trimmedName = String(name || "").trim();
  if (!projectFirmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  const employee = {
    id: createId(),
    project_firm_id: projectFirmId,
    name: trimmedName,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.projectLocalFirmEmployees = [...(db.projectLocalFirmEmployees || []), employee];
  writeDb(db);
  return employee;
}

export function updateEmployee({ employeeId, name }) {
  const trimmedName = String(name || "").trim();
  if (!employeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  let updatedEmployee = null;

  db.projectLocalFirmEmployees = (db.projectLocalFirmEmployees || []).map((employee) => {
    if (String(employee.id) !== String(employeeId) || employee.removed_at) {
      return employee;
    }

    updatedEmployee = {
      ...employee,
      name: trimmedName,
      updated_at: now,
    };
    return updatedEmployee;
  });

  if (!updatedEmployee) {
    throw new Error("Projektinterner Mitarbeiter wurde nicht gefunden.");
  }

  writeDb(db);
  return updatedEmployee;
}

export function removeEmployee(employeeId) {
  if (!employeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }

  const db = readDb();
  const currentEmployee = (db.projectLocalFirmEmployees || []).find(
    (employee) => String(employee.id) === String(employeeId) && !employee.removed_at,
  ) || null;
  if (!currentEmployee) {
    throw new Error("Projektinterner Mitarbeiter wurde nicht gefunden.");
  }

  const openMeetingIds = new Set(
    (db.meetings || [])
      .filter((meeting) => !meeting.is_closed)
      .map((meeting) => String(meeting.id)),
  );
  const isParticipantInOpenMeeting = (db.meetingPersonParticipants || []).some(
    (participant) =>
      participant.person_kind === "project_local_employee"
      && String(participant.person_id) === String(employeeId)
      && openMeetingIds.has(String(participant.meeting_id)),
  );
  if (isParticipantInOpenMeeting) {
    throw new Error("Projektinterner Mitarbeiter kann nicht geloescht werden, solange er noch Teilnehmer in einer offenen Besprechung ist.");
  }

  const now = nowIso();
  let removedEmployee = null;

  db.projectLocalFirmEmployees = (db.projectLocalFirmEmployees || []).map((employee) => {
    if (String(employee.id) !== String(employeeId) || employee.removed_at) {
      return employee;
    }

    removedEmployee = {
      ...employee,
      removed_at: now,
      updated_at: now,
    };
    return removedEmployee;
  });

  writeDb(db);
  return removedEmployee;
}
