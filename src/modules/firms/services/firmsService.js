import { listFirms as listFirmsDataSource } from '../data/fakeFirmsDataSource.js';

export async function listFirms() {
  return listFirmsDataSource();
}
