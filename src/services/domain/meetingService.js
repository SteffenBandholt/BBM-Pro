import * as meetingsRepo from "../repositories/meetingsRepo.js";
import * as meetingTopsRepo from "../repositories/meetingTopsRepo.js";
import * as topsRepo from "../repositories/topsRepo.js";
import { todayYmd } from "../utils/time.js";
import * as participantService from "./participantService.js";
import * as projectFirmsRepo from "../repositories/projectFirmsRepo.js";

function buildDisplayNumbers(rows) {
  const byId = new Map(rows.map((r) => [String(r.id), r]));
  const memo = new Map();
  const stack = new Set();

  const build = (id) => {
    const key = String(id);
    if (memo.has(key)) return memo.get(key);
    if (stack.has(key)) return "";
    stack.add(key);
    const node = byId.get(key);
    if (!node) {
      stack.delete(key);
      return "";
    }
    const own = node.number == null ? "" : String(node.number);
    if (!node.parent_top_id) {
      memo.set(key, own);
      stack.delete(key);
      return own;
    }
    const parent = build(node.parent_top_id);
    const res = parent ? `${parent}.${own}` : own;
    memo.set(key, res);
    stack.delete(key);
    return res;
  };

  rows.forEach((r) => build(r.id));
  return memo;
}

function computeAmpel(status, dueDate) {
  const s = String(status || "").toLowerCase();
  if (s === "blockiert") return { color: "blau", reason: "Status blockiert" };
  if (s === "verzug") return { color: "rot", reason: "Status Verzug" };
  if (s === "erledigt") return { color: "gruen", reason: "Erledigt" };

  const isDateRelevant = s === "offen" || s === "in arbeit";
  if (!isDateRelevant || !dueDate) return { color: null, reason: "Keine Ampel" };

  const d = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  const today = new Date();
  const ms = d.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (Number.isNaN(days)) return { color: null, reason: "Ungültiges Datum" };
  if (days <= 0) return { color: "rot", reason: "Termin erreicht" };
  if (days <= 10) return { color: "orange", reason: "Termin < 10 Tage" };
  return { color: "gruen", reason: "Termin > 10 Tage" };
}

function shouldSkipCarryover(row) {
  // Skip if hidden
  if (row.is_hidden) return true;
  // Level 1 always keeps
  if (Number(row.level) === 1) return false;
  // Exclude already carried, done, untouched for N+2
  const isDone = String(row.status || "").toLowerCase() === "erledigt";
  const alreadyCarried = Number(row.is_carried_over) === 1;
  const touched = Number(row.is_touched) === 1;
  const hasCompletion = !!row.completed_in_meeting_id;
  if (isDone && alreadyCarried && !touched && hasCompletion) return true;
  return false;
}

function carryOverFromMeeting(lastMeetingId, newMeetingId) {
  if (!lastMeetingId) return { inserted: 0 };
  // Filter rows to skip (erledigt, bereits einmal übernommen, nicht verändert)
  const sourceRows = meetingTopsRepo.listJoinedByMeeting(lastMeetingId);
  const skipIds = new Set(
    sourceRows.filter((r) => shouldSkipCarryover(r)).map((r) => r.id),
  );
  return meetingTopsRepo.carryOverFromMeeting(lastMeetingId, newMeetingId, { skipIds });
}

export function createMeeting({ projectId, title }) {
  if (!projectId) throw new Error("projectId required");
  const existing = meetingsRepo.getOpenMeetingByProject(projectId);
  if (existing) return existing;

  const meeting = meetingsRepo.createMeeting({ projectId, title });

  // Carryover from last closed meeting
  const lastClosed = meetingsRepo.getLastClosedMeetingByProject(projectId);
  if (lastClosed?.id) {
    carryOverFromMeeting(lastClosed.id, meeting.id);
  }

  // Seed participants from project firms
  projectFirmsRepo.ensureSampleFirms(projectId);
  participantService.seedParticipantsFromProject(meeting.id, projectId);

  return meeting;
}

export function listMeetings(projectId) {
  return meetingsRepo.listByProject(projectId);
}

export function getMeeting(meetingId) {
  return meetingsRepo.getMeetingById(meetingId);
}

export function markTopDone({ meetingId, topId }) {
  // helper for TopService
  return meetingTopsRepo.updateMeetingTop({
    meetingId,
    topId,
    status: "erledigt",
    dueDate: todayYmd(),
    completed_in_meeting_id: meetingId,
  });
}

function checkNumberGaps(rows) {
  // consider visible rows only
  const visible = rows.filter((r) => !r.is_hidden && !r.is_trashed && !r.removed_at);
  const groups = new Map(); // key: level::parent
  visible.forEach((r) => {
    const level = Number(r.level);
    if (!Number.isFinite(level) || level < 1 || level > 4) return;
    const parent = r.parent_top_id ? String(r.parent_top_id) : "root";
    const key = `${level}::${parent}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ id: r.id, number: Number(r.number) });
  });

  const gaps = [];
  const markTopIds = new Set();

  groups.forEach((items, _key) => {
    const nums = items.map((i) => i.number).filter((n) => Number.isFinite(n) && n > 0);
    if (!nums.length) return;
    const max = Math.max(...nums);
    for (let i = 1; i <= max; i += 1) {
      if (!nums.includes(i)) {
        // mark last item in group (by id for stability)
        const last = items.reduce((acc, cur) => (acc && acc.id > cur.id ? acc : cur), null);
        if (last) markTopIds.add(last.id);
        gaps.push({ missingNumber: i, level: items[0].level, parentTopId: items[0].parent_top_id ?? null });
        break;
      }
    }
  });

  return { gaps, markTopIds: Array.from(markTopIds) };
}

function snapshotMeetingTops(meetingId) {
  const rows = meetingTopsRepo.listJoinedByMeeting(meetingId);
  const displayMap = buildDisplayNumbers(rows);
  const now = new Date().toISOString();

  rows.forEach((row) => {
    const disp = displayMap.get(String(row.id)) || String(row.number || "");
    const ampel = computeAmpel(row.status, row.due_date);
    meetingTopsRepo.updateMeetingTop({
      meetingId,
      topId: row.id,
      // frozen fields
      frozen_title: row.title,
      frozen_is_hidden: row.is_hidden ? 1 : 0,
      frozen_parent_top_id: row.parent_top_id,
      frozen_level: row.level,
      frozen_number: row.number,
      frozen_display_number: disp,
      frozen_ampel_color: ampel.color,
      frozen_ampel_reason: ampel.reason,
      frozen_at: now,
    });
  });
}

export function closeMeeting(meetingId) {
  const meeting = meetingsRepo.getMeetingById(meetingId);
  if (!meeting) return { ok: false, errorCode: "NOT_FOUND", error: "Besprechung nicht gefunden." };
  if (meeting.is_closed) return { ok: false, errorCode: "ALREADY_CLOSED", error: "Besprechung ist bereits geschlossen." };

  const rows = meetingTopsRepo.listJoinedByMeeting(meetingId);
  const gapCheck = checkNumberGaps(rows);
  if (gapCheck.gaps.length > 0) {
    return {
      ok: false,
      errorCode: "NUM_GAP",
      error: "Nummernlücke gefunden.",
      gaps: gapCheck.gaps,
      markTopIds: gapCheck.markTopIds,
    };
  }

  // snapshot frozen_* for print/carryover consistency
  snapshotMeetingTops(meetingId);

  const closed = meetingsRepo.closeMeeting(meetingId, {});
  return { ok: true, meeting: closed };
}

export const internal = {
  carryOverFromMeeting,
};
