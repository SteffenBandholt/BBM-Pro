import * as participantService from "../../../services/domain/participantService.js";

export async function listMeetingParticipants(meetingId) {
  return participantService.listMeetingParticipants(meetingId);
}

export async function listMeetingParticipantPool(meetingId) {
  return participantService.listMeetingParticipantPool(meetingId);
}

export async function setMeetingParticipant({ meetingId, personKind, personId, firmId, is_present, is_in_distribution }) {
  return participantService.setMeetingParticipant({
    meetingId,
    personKind,
    personId,
    firmId,
    is_present,
    is_in_distribution,
  });
}

export async function removeMeetingParticipant({ meetingId, personKind, personId, firmId }) {
  return participantService.removeMeetingParticipant({ meetingId, personKind, personId, firmId });
}
