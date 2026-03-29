import { listProjectParticipants as listProjectParticipantsDataSource } from '../data/fakeProjectParticipantsDataSource.js';

export async function listProjectParticipants() {
  return listProjectParticipantsDataSource();
}
