import { getRepos } from "../repositories/index.js";
import { todayYmd } from "../utils/time.js";

const { topsRepo, meetingTopsRepo, meetingsRepo, projectFirmsRepo } = getRepos();

const MAX_LEVEL = 4;

async function assertOpenMeeting(meetingId) {
  const meeting = await meetingsRepo.getMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.is_closed) throw new Error("Meeting is closed");
  return meeting;
}

function ensureLevel(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv < 1 || lv > MAX_LEVEL) throw new Error("Invalid level");
  return lv;
}

export async function listByMeeting(meetingId) {
  return meetingTopsRepo.listJoinedByMeeting(meetingId);
}

export async function createTop({ projectId, meetingId, parentTopId = null, level, title }) {
  const meeting = await assertOpenMeeting(meetingId);
  if (String(meeting.project_id) !== String(projectId)) throw new Error("Project mismatch");
  const lvl = ensureLevel(level);
  if (lvl > 1 && !parentTopId) throw new Error("Parent required for non-root");
  if (lvl === 1 && parentTopId) throw new Error("Root must not have parent");
  if (lvl > MAX_LEVEL) throw new Error("Max level exceeded");

  if (parentTopId) {
    const parent = await topsRepo.getTopById(parentTopId);
    if (!parent || String(parent.project_id) !== String(projectId)) throw new Error("Parent not found");
    if (Number(parent.level) !== lvl - 1) throw new Error("Parent level mismatch");
  }

  const number = await topsRepo.getNextNumber(projectId, parentTopId || null);
  const created = await topsRepo.createTop({ projectId, parentTopId, level: lvl, number, title });
  await meetingTopsRepo.attachTopToMeeting({
    meetingId,
    topId: created.id,
    status: "offen",
    dueDate: todayYmd(),
    isCarriedOver: false,
  });
  return created;
}

export async function moveTop({ topId, targetParentId = null }) {
  const top = await topsRepo.getTopById(topId);
  if (!top) throw new Error("TOP not found");

  const openMeeting = await meetingsRepo.getOpenMeetingByProject(top.project_id);
  if (!openMeeting) throw new Error("No open meeting for project");
  const mt = await meetingTopsRepo.getMeetingTop(openMeeting.id, topId);
  if (!mt) throw new Error("TOP not in open meeting");
  if (mt.is_carried_over) throw new Error("Carried TOP cannot move");

  if (targetParentId) {
    if (String(targetParentId) === String(topId)) throw new Error("Cannot move under itself");
    const parent = await topsRepo.getTopById(targetParentId);
    if (!parent || String(parent.project_id) !== String(top.project_id))
      throw new Error("Target parent missing or different project");
    if (Number(parent.level) >= MAX_LEVEL) throw new Error("Target too deep");
    // cycle guard
    let cur = parent;
    let guard = 0;
    while (cur && guard < 100) {
      if (String(cur.id) === String(topId)) throw new Error("Cycle not allowed");
      if (!cur.parent_top_id) break;
      cur = await topsRepo.getTopById(cur.parent_top_id);
      guard += 1;
    }
  } else if (Number(top.level) !== 1) {
    throw new Error("Only level-1 may be root");
  }

  const newParent = targetParentId ? await topsRepo.getTopById(targetParentId) : null;
  const newLevel = targetParentId ? ((newParent?.level || 0) + 1) : 1;
  const newNumber = await topsRepo.getNextNumber(top.project_id, targetParentId || null);
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

export async function updateMeetingFields({ meetingId, topId, patch }) {
  await assertOpenMeeting(meetingId);
  const mt = await meetingTopsRepo.getMeetingTop(meetingId, topId);
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
    await topsRepo.updateTitle({ topId, title: next.title });
  }
  if (next.is_hidden !== undefined) {
    await topsRepo.setHidden({ topId, isHidden: !!next.is_hidden });
  }

  // Validate responsible firm
  if (patch.responsible_kind !== undefined || patch.responsible_id !== undefined || patch.responsible_label !== undefined) {
    const kind = patch.responsible_kind ?? patch.responsibleKind ?? mt.responsible_kind ?? null;
    const responsibleId = patch.responsible_id ?? patch.responsibleId ?? mt.responsible_id ?? null;
    if (kind === null) {
      next.responsible_kind = null;
      next.responsible_id = null;
      next.responsible_label = null;
    } else if (kind === "firm") {
      if (!responsibleId) throw new Error("Verantwortliche Firma fehlt");
      const firm = await projectFirmsRepo.getById(responsibleId);
      if (!firm) throw new Error("Verantwortliche Firma existiert nicht");
      next.responsible_kind = "firm";
      next.responsible_id = firm.id;
      next.responsible_label = firm.name;
    } else {
      throw new Error("Verantwortlichkeitsart nicht erlaubt (nur firm)");
    }
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
    responsible_kind: next.responsible_kind ?? mt.responsible_kind,
    responsible_id: next.responsible_id ?? mt.responsible_id,
    responsible_label: next.responsible_label ?? mt.responsible_label,
    contact_kind: patch.contact_kind,
    contact_person_id: patch.contact_person_id,
    contact_label: patch.contact_label,
  });
}

export async function deleteTop({ meetingId, topId }) {
  await assertOpenMeeting(meetingId);
  const mt = await meetingTopsRepo.getMeetingTop(meetingId, topId);
  if (!mt) throw new Error("TOP not in meeting");
  if (Number(mt.is_carried_over) === 1) throw new Error("Carried TOP cannot be deleted");
  if (await topsRepo.hasChildren(topId)) throw new Error("TOP has children");
  await meetingTopsRepo.deleteByTopId(topId);
  return topsRepo.softDeleteTop({ topId });
}
