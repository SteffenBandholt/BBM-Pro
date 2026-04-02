import * as localMeetingsDataSource from './localMeetingsDataSource.js';

export async function listMeetings(projectId) {
  return localMeetingsDataSource.listMeetings(projectId);
}

export async function createMeeting(projectId, input) {
  return localMeetingsDataSource.createMeeting(projectId, input);
}

export async function updateMeetingKeyword(meetingId, keyword) {
  return localMeetingsDataSource.updateMeetingKeyword(meetingId, keyword);
}

export async function updateMeetingLabel(meetingId, protocolLabel) {
  return localMeetingsDataSource.updateMeetingLabel(meetingId, protocolLabel);
}
