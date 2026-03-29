import { listDefects as listDefectsDataSource } from '../data/fakeDefectsDataSource.js';

export async function listDefects() {
  return listDefectsDataSource();
}
