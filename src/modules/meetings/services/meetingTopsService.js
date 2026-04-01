import {
  listByMeeting,
  createTop as createTopDomain,
  updateMeetingFields,
  deleteTop as deleteTopDomain,
  moveTop as moveTopDomain,
} from "../../../services/domain/topService.js";

export async function listMeetingTops(meetingId) {
  return listByMeeting(meetingId);
}

export async function createTop({ projectId, meetingId, parentTopId, level, title }) {
  return createTopDomain({ projectId, meetingId, parentTopId, level, title });
}

export async function updateMeetingTop({ meetingId, topId, patch }) {
  return updateMeetingFields({ meetingId, topId, patch });
}

export async function deleteTop({ meetingId, topId }) {
  return deleteTopDomain({ meetingId, topId });
}

export async function moveTop({ topId, targetParentId }) {
  return moveTopDomain({ topId, targetParentId });
}
