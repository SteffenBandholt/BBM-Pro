// Simple JSON persistence using localStorage (renderer-safe).
// Keeps a tiny in-memory cache to reduce repeated parses.

const DB_KEY = "bbmpro.db.v1";

function defaultDb() {
  return {
    projects: [],
    meetings: [],
    tops: [],
    meetingTops: [],
    globalFirms: [],
    projectFirms: [],
    projectPersons: [],
    meetingParticipants: [],
  };
}

let cache = null;

function readRaw() {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      cache = defaultDb();
      return cache;
    }
    const parsed = JSON.parse(raw);
    cache = {
      ...defaultDb(),
      ...parsed,
      projects: parsed.projects ?? [],
      meetings: parsed.meetings ?? [],
      tops: parsed.tops ?? [],
      meetingTops: parsed.meetingTops ?? [],
      globalFirms: parsed.globalFirms ?? [],
      projectFirms: parsed.projectFirms ?? [],
      projectPersons: parsed.projectPersons ?? [],
      meetingParticipants: parsed.meetingParticipants ?? [],
    };
    return cache;
  } catch (_err) {
    cache = defaultDb();
    return cache;
  }
}

function writeRaw(db) {
  cache = { ...defaultDb(), ...db };
  window.localStorage.setItem(DB_KEY, JSON.stringify(cache));
  return cache;
}

export function readDb() {
  const db = readRaw();
  // Return a defensive copy to avoid accidental mutations.
  return {
    projects: [...db.projects],
    meetings: [...db.meetings],
    tops: [...db.tops],
    meetingTops: [...db.meetingTops],
    globalFirms: [...db.globalFirms],
    projectFirms: [...db.projectFirms],
    projectPersons: [...db.projectPersons],
    meetingParticipants: [...db.meetingParticipants],
  };
}

export function writeDb(nextDb) {
  return writeRaw(nextDb);
}

export function resetDb() {
  return writeRaw(defaultDb());
}
