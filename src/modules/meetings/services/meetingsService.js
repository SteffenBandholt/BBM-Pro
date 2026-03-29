import {
  createMeeting as createMeetingDataSource,
  listMeetings as listMeetingsDataSource,
} from '../data/fakeMeetingsDataSource.js';

export async function listMeetings(projectId) {
  return listMeetingsDataSource(projectId);
}

export async function createMeeting(projectId, input) {
  return createMeetingDataSource(projectId, input);
}
