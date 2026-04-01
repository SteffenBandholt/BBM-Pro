import * as topsRepo from "../repositories/topsRepo.js";
import * as meetingTopsRepo from "../repositories/meetingTopsRepo.js";
import * as meetingsRepo from "../repositories/meetingsRepo.js";
import { todayYmd } from "../utils/time.js";

const MAX_LEVEL = 4;

function assertOpenMeeting(meetingId) {
  const meeting = meetingsRepo.getMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.is_closed) throw new Error("Meeting is closed");
  return meeting;
}

function ensureLevel(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv < 1 || lv > MAX_LEVEL) throw new Error("Invalid level");
  return lv;
}

export function listByMeeting(meetingId) {
  return meetingTopsRepo.listJoinedByMeeting(meetingId);
}

export function createTop({ projectId, meetingId, parentTopId = null, level, title }) {
  const meeting = assertOpenMeeting(meetingId);
  if (String(meeting.project_id) !== String(projectId)) throw new Error("Project mismatch");
  const lvl = ensureLevel(level);
  if (lvl > 1 && !parentTopId) throw new Error("Parent required for non-root");
  if (lvl === 1 && parentTopId) throw new Error("Root must not have parent");
  if (lvl > MAX_LEVEL) throw new Error("Max level exceeded");

  if (parentTopId) {
    const parent = topsRepo.getTopById(parentTopId);
    if (!parent || String(parent.project_id) !== String(projectId)) throw new Error("Parent not found");
    if (Number(parent.level) !== lvl - 1) throw new Error("Parent level mismatch");
  }

  const number = topsRepo.getNextNumber(projectId, parentTopId || null);
  const created = topsRepo.createTop({ projectId, parentTopId, level: lvl, number, title });
  meetingTopsRepo.attachTopToMeeting({
    meetingId,
    topId: created.id,
    status: "offen",
    dueDate: todayYmd(),
    isCarriedOver: false,
  });
  return created;
}

export function moveTop({ topId, targetParentId = null }) {
  const top = topsRepo.getTopById(topId);
  if (!top) throw new Error("TOP not found");

  const openMeeting = meetingsRepo.getOpenMeetingByProject(top.project_id);
  if (!openMeeting) throw new Error("No open meeting for project");
  const mt = meetingTopsRepo.getMeetingTop(openMeeting.id, topId);
  if (!mt) throw new Error("TOP not in open meeting");
  if (mt.is_carried_over) throw new Error("Carried TOP cannot move");

  if (targetParentId) {
    if (String(targetParentId) === String(topId)) throw new Error("Cannot move under itself");
    const parent = topsRepo.getTopById(targetParentId);
    if (!parent || String(parent.project_id) !== String(top.project_id))
      throw new Error("Target parent missing or different project");
    if (Number(parent.level) >= MAX_LEVEL) throw new Error("Target too deep");
    // cycle guard
    let cur = parent;
    let guard = 0;
    while (cur && guard < 100) {
      if (String(cur.id) === String(topId)) throw new Error("Cycle not allowed");
      if (!cur.parent_top_id) break;
      cur = topsRepo.getTopById(cur.parent_top_id);
      guard += 1;
    }
  } else if (Number(top.level) !== 1) {
    throw new Error("Only level-1 may be root");
  }

  const newLevel = targetParentId ? (topsRepo.getTopById(targetParentId).level || 0) + 1 : 1;
  const newNumber = topsRepo.getNextNumber(top.project_id, targetParentId || null);
  return topsRepo.moveTop({ topId, targetParentId, newLevel, newNumber });
}

function detectTouched(prev, patch) {
  const fields = [
    ["title", (v) => v?.trim() ?? ""],
    ["longtext", (v) => v ?? ""],
    ["status", (v) => (v ?? "").toLowerCase()],
    ["due_date", (v) => v ?? ""],
    ["dueDate", (v) => v ?? ""],
    ["responsible_label", (v) => v ?? ""],
    ["contact_label", (v) => v ?? ""],
  ];
  return fields.some(([key, norm]) => norm(patch[key]) !== norm(prev[key] ?? prev[key.replace("_", "")]));
}

export function updateMeetingFields({ meetingId, topId, patch }) {
  assertOpenMeeting(meetingId);
  const mt = meetingTopsRepo.getMeetingTop(meetingId, topId);
  if (!mt) throw new Error("TOP not in meeting");

  const isCarried = Number(mt.is_carried_over) === 1;
  const next = { ...patch };

  // If status set to erledigt -> set due + completed
  if (patch.status && String(patch.status).toLowerCase() === "erledigt") {
    next.status = "erledigt";
    next.dueDate = todayYmd();
    next.completed_in_meeting_id = meetingId;
  }

  // Touch detection for carried-over TOPs
  if (isCarried && detectTouched(mt, next)) {
    next.is_touched = 1;
  }

  // Title updates: forbid on carried-over? keep simple: allow, still sets touched.
  if (next.title !== undefined) {
    topsRepo.updateTitle({ topId, title: next.title });
  }
  if (next.is_hidden !== undefined) {
    topsRepo.setHidden({ topId, isHidden: !!next.is_hidden });
  }

  return meetingTopsRepo.updateMeetingTop({
    meetingId,
    topId,
    status: next.status,
    dueDate: next.dueDate ?? patch.due_date,
    longtext: next.longtext ?? patch.longtext,
    completed_in_meeting_id: next.completed_in_meeting_id,
    is_important: patch.is_important,
    is_touched: next.is_touched,
    is_task: patch.is_task,
    is_decision: patch.is_decision,
    responsible_kind: patch.responsible_kind,
    responsible_id: patch.responsible_id,
    responsible_label: patch.responsible_label,
    contact_kind: patch.contact_kind,
    contact_person_id: patch.contact_person_id,
    contact_label: patch.contact_label,
  });
}

export function deleteTop({ meetingId, topId }) {
  assertOpenMeeting(meetingId);
  const mt = meetingTopsRepo.getMeetingTop(meetingId, topId);
  if (!mt) throw new Error("TOP not in meeting");
  if (Number(mt.is_carried_over) === 1) throw new Error("Carried TOP cannot be deleted");
  if (topsRepo.hasChildren(topId)) throw new Error("TOP has children");
  meetingTopsRepo.deleteByTopId(topId);
  return topsRepo.softDeleteTop({ topId });
}
