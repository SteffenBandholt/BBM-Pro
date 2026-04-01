import * as localMeetingsDataSource from './localMeetingsDataSource.js';

export async function listMeetings(projectId) {
  return localMeetingsDataSource.listMeetings(projectId);
}

export async function createMeeting(projectId, input) {
  return localMeetingsDataSource.createMeeting(projectId, input);
}
