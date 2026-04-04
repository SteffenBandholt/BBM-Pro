import { getRepos } from "../repositories/index.js";

const {
  globalFirmEmployeesRepo,
  meetingParticipantsRepo,
  meetingsRepo,
  projectFirmEmployeesRepo,
  projectFirmsRepo,
  projectLocalFirmEmployeesRepo,
} = getRepos();

function participantKey(personKind, personId) {
  return `${personKind}::${personId}`;
}

function sortPoolEntries(a, b) {
  const firmCompare = String(a.firmName || "").localeCompare(String(b.firmName || ""));
  if (firmCompare !== 0) return firmCompare;
  return String(a.personName || "").localeCompare(String(b.personName || ""));
}

function mapGlobalEmployeeToPool(employee, firm) {
  return {
    personKind: "global_employee",
    personId: employee.id,
    firmId: firm.id,
    firmName: firm.name || "Firma",
    personName: employee.name || "Mitarbeiter",
    source: "global",
  };
}

function mapProjectLocalEmployeeToPool(employee, firm) {
  return {
    personKind: "project_local_employee",
    personId: employee.id,
    firmId: firm.id,
    firmName: firm.name || "Firma",
    personName: employee.name || "Mitarbeiter",
    source: "project-local",
  };
}

async function buildPoolEntriesForFirm(firm) {
  const [activeGlobalEmployeeRows, projectLocalEmployees, globalEmployees] = await Promise.all([
    projectFirmEmployeesRepo.listByProjectFirm(firm.id),
    projectLocalFirmEmployeesRepo.listByProjectFirm(firm.id),
    firm.global_firm_id ? globalFirmEmployeesRepo.listByFirm(firm.global_firm_id) : Promise.resolve([]),
  ]);

  const activeGlobalEmployeeIds = new Set(
    activeGlobalEmployeeRows.map((employeeRow) => String(employeeRow.global_employee_id)),
  );

  const activeGlobalEmployees = globalEmployees
    .filter((employee) => activeGlobalEmployeeIds.has(String(employee.id)))
    .map((employee) => mapGlobalEmployeeToPool(employee, firm));

  const projectLocalPoolEntries = projectLocalEmployees.map((employee) => mapProjectLocalEmployeeToPool(employee, firm));

  return [...activeGlobalEmployees, ...projectLocalPoolEntries];
}

async function getValidatedPoolEntry(meetingId, { personKind, personId, firmId = null }) {
  const meeting = await meetingsRepo.getMeetingById(meetingId);
  if (!meeting) {
    throw new Error("Besprechung nicht gefunden");
  }

  const pool = await listProjectParticipantPool(meeting.project_id);
  const entry = pool.find((item) => (
    String(item.personKind) === String(personKind)
    && String(item.personId) === String(personId)
    && (!firmId || String(item.firmId) === String(firmId))
  ));

  if (!entry) {
    throw new Error("Person ist nicht Teil des Projektmitarbeiter-Pools.");
  }

  return entry;
}

function mapParticipantRowToUi(poolEntry, participantRow = null) {
  return {
    personKind: poolEntry.personKind,
    personId: poolEntry.personId,
    firmId: poolEntry.firmId,
    firmName: poolEntry.firmName,
    personName: poolEntry.personName,
    source: poolEntry.source,
    isParticipant: !!participantRow,
    is_present: participantRow ? !!participantRow.is_present : false,
    is_in_distribution: participantRow ? !!participantRow.is_in_distribution : false,
  };
}

export async function listMeetingParticipants(meetingId) {
  return meetingParticipantsRepo.listMeetingParticipants(meetingId);
}

export async function listProjectParticipantPool(projectId) {
  const firms = await projectFirmsRepo.listByProject(projectId);
  const poolEntries = await Promise.all(firms.map((firm) => buildPoolEntriesForFirm(firm)));
  return poolEntries.flat().sort(sortPoolEntries);
}

export async function listMeetingParticipantPool(meetingId) {
  const meeting = await meetingsRepo.getMeetingById(meetingId);
  if (!meeting) {
    throw new Error("Besprechung nicht gefunden");
  }

  const [pool, storedParticipants] = await Promise.all([
    listProjectParticipantPool(meeting.project_id),
    meetingParticipantsRepo.listMeetingParticipants(meetingId),
  ]);
  const participantsByKey = new Map(
    storedParticipants.map((participant) => [
      participantKey(participant.person_kind, participant.person_id),
      participant,
    ]),
  );

  return pool.map((poolEntry) =>
    mapParticipantRowToUi(poolEntry, participantsByKey.get(participantKey(poolEntry.personKind, poolEntry.personId)) || null),
  );
}

export async function setMeetingParticipant({
  meetingId,
  personKind,
  personId,
  firmId,
  is_present,
  is_in_distribution,
}) {
  const participant = await getValidatedPoolEntry(meetingId, { personKind, personId, firmId });

  return meetingParticipantsRepo.setMeetingParticipant({
    meetingId,
    personKind: participant.personKind,
    personId: participant.personId,
    firmId: participant.firmId,
    personName: participant.personName,
    firmName: participant.firmName,
    is_present,
    is_in_distribution,
  });
}

export async function removeMeetingParticipant({ meetingId, personKind, personId, firmId }) {
  await getValidatedPoolEntry(meetingId, { personKind, personId, firmId });
  return meetingParticipantsRepo.removeMeetingParticipant({ meetingId, personKind, personId });
}

export async function seedParticipantsFromProject(meetingId, projectId) {
  const [pool, lastClosedMeeting] = await Promise.all([
    listProjectParticipantPool(projectId),
    meetingsRepo.getLastClosedMeetingByProject(projectId),
  ]);

  const validPoolEntries = new Map(
    pool.map((participant) => [participantKey(participant.personKind, participant.personId), participant]),
  );

  const previousParticipants = lastClosedMeeting?.id
    ? await meetingParticipantsRepo.listMeetingParticipants(lastClosedMeeting.id)
    : [];

  const copiedParticipants = previousParticipants
    .map((participantRow) => {
      const poolEntry = validPoolEntries.get(participantKey(participantRow.person_kind, participantRow.person_id));
      if (!poolEntry) {
        return null;
      }

      return {
        personKind: poolEntry.personKind,
        personId: poolEntry.personId,
        firmId: poolEntry.firmId,
        personName: poolEntry.personName,
        firmName: poolEntry.firmName,
        is_present: !!participantRow.is_present,
        is_in_distribution: !!participantRow.is_in_distribution,
      };
    })
    .filter(Boolean);

  const participantsToStore = copiedParticipants.length > 0
    ? copiedParticipants
    : pool.map((participant) => ({
      personKind: participant.personKind,
      personId: participant.personId,
      firmId: participant.firmId,
      personName: participant.personName,
      firmName: participant.firmName,
      is_present: false,
      is_in_distribution: false,
    }));

  return meetingParticipantsRepo.replaceMeetingParticipants(meetingId, participantsToStore);
}
