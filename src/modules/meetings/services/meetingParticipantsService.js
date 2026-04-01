import * as participantService from "../../../services/domain/participantService.js";

export async function listMeetingParticipants(meetingId) {
  return participantService.listMeetingParticipants(meetingId);
}

export async function setMeetingParticipant({ meetingId, firmId, is_present, is_in_distribution }) {
  return participantService.setMeetingParticipant({ meetingId, firmId, is_present, is_in_distribution });
}
