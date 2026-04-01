import { getRepos } from "../repositories/index.js";

const { meetingParticipantsRepo, projectFirmsRepo } = getRepos();

export function listMeetingParticipants(meetingId) {
  return meetingParticipantsRepo.listMeetingParticipants(meetingId);
}

export function setMeetingParticipant({ meetingId, firmId, is_present, is_in_distribution }) {
  const firm = projectFirmsRepo.getById(firmId);
  if (!firm) throw new Error("Firma nicht gefunden");
  return meetingParticipantsRepo.setMeetingParticipant({
    meetingId,
    firmId,
    is_present,
    is_in_distribution,
  });
}

export function seedParticipantsFromProject(meetingId, projectId) {
  return meetingParticipantsRepo.seedFromProject(meetingId, projectId);
}
