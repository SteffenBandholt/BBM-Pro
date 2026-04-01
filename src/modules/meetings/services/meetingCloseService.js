import { closeMeeting as closeMeetingDomain } from "../../../services/domain/meetingService.js";

export async function closeMeeting(meetingId) {
  return closeMeetingDomain(meetingId);
}
