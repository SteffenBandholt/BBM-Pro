import { getRepos } from "../repositories/index.js";
import { todayYmd } from "../utils/time.js";

const { topsRepo, meetingTopsRepo, meetingsRepo, projectFirmsRepo } = getRepos();

const MAX_LEVEL = 4;

async function assertOpenMeeting(meetingId) {
  const meeting = await meetingsRepo.getMeetingById(meetingId);
  if (!meeting) throw new Error("Besprechung nicht gefunden");
  if (meeting.is_closed) throw new Error("Besprechung ist geschlossen");
  return meeting;
}

function ensureLevel(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv < 1 || lv > MAX_LEVEL) throw new Error("Ungültiges Level");
  return lv;
}

export async function listByMeeting(meetingId) {
  return meetingTopsRepo.listJoinedByMeeting(meetingId);
}

export async function createTop({ projectId, meetingId, parentTopId = null, level, title }) {
  if (!projectId) throw new Error("projectId required");
  if (!meetingId) throw new Error("meetingId required");
  if (!title) throw new Error("title required");

  const meeting = await assertOpenMeeting(meetingId);
  if (String(meeting.project_id) !== String(projectId)) throw new Error("Project mismatch");

  // Level ableiten falls Parent gesetzt
  let lvl = Number(level) || 1;
  if (parentTopId) {
    const parent = await topsRepo.getTopById(parentTopId);
    if (!parent || String(parent.project_id) !== String(projectId)) throw new Error("Parent not found");
    lvl = Number(parent.level || 1) + 1;
  }
  lvl = ensureLevel(lvl);
  if (lvl === 1 && parentTopId) throw new Error("Root darf keinen Parent haben");
  if (lvl > MAX_LEVEL) throw new Error("Max Level 4 erreicht");

  // Nummer bestimmen
  const number = await topsRepo.getNextNumber(projectId, parentTopId || null);

  // Anlegen
  const created = await topsRepo.createTop({
    projectId,
    parentTopId: parentTopId || null,
    level: lvl,
    number,
    title,
  });

  // Meeting-Bezug herstellen
  const todayIso = todayYmd();
  await meetingTopsRepo.attachTopToMeeting({
    meetingId,
    topId: created.id,
    status: "offen",
    dueDate: lvl === 1 ? null : todayIso,
    longtext: null,
    isCarriedOver: false,
  });

  return created;
}

export async function moveTop({ topId, targetParentId = null }) {
  if (!topId) throw new Error("topId required");

  const top = await topsRepo.getTopById(topId);
  if (!top) throw new Error("TOP nicht gefunden");

  const openMeeting = await meetingsRepo.getOpenMeetingByProject(top.project_id);
  if (!openMeeting) throw new Error("Kein offenes Meeting für dieses Projekt");

  const mt = await meetingTopsRepo.getMeetingTop(openMeeting.id, topId);
  if (!mt) throw new Error("TOP gehört nicht zum offenen Meeting");
  if (Number(mt.is_carried_over) === 1) throw new Error("Übernommener TOP kann nicht verschoben werden");

  // Zielvalidierung
  let newLevel = Number(top.level);
  if (targetParentId) {
    if (String(targetParentId) === String(topId)) throw new Error("Zielparent ist derselbe TOP");
    const parent = await topsRepo.getTopById(targetParentId);
    if (!parent || String(parent.project_id) !== String(top.project_id)) {
      throw new Error("Ziel-Parent fehlt oder anderes Projekt");
    }
    const parentLevel = Number(parent.level);
    if (!Number.isFinite(parentLevel) || parentLevel < 1 || parentLevel > 4) {
      throw new Error("Ziel-Parent hat ungültiges Level");
    }
    if (parentLevel >= MAX_LEVEL) throw new Error("Maximale Tiefe erreicht (unter Level 4 nicht erlaubt)");

    // Zyklus-Check
    let cur = parent;
    let guard = 0;
    while (cur && guard < 100) {
      if (String(cur.id) === String(topId)) throw new Error("Zyklus nicht erlaubt");
      if (!cur.parent_top_id) break;
      cur = await topsRepo.getTopById(cur.parent_top_id);
      guard += 1;
    }

    newLevel = parentLevel + 1;
    if (newLevel > MAX_LEVEL) throw new Error("Maximale Tiefe 4 überschritten");
  } else {
    // Root nur für Level-1
    if (Number(top.level) !== 1) throw new Error("Nur Level-1 darf root sein");
    newLevel = 1;
  }

  const newNumber = await topsRepo.getNextNumber(top.project_id, targetParentId || null);
  return topsRepo.moveTop({
    topId,
    targetParentId: targetParentId || null,
    newLevel,
    newNumber,
  });
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

  // Validate responsible firm (not applicable for titles)
  if (mt.level === 1) {
    next.responsible_kind = null;
    next.responsible_id = null;
    next.responsible_label = null;
  } else if (patch.responsible_kind !== undefined || patch.responsible_id !== undefined || patch.responsible_label !== undefined) {
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
  if (!meetingId) throw new Error("meetingId required");
  if (!topId) throw new Error("topId required");

  const meeting = await assertOpenMeeting(meetingId);
  const mt = await meetingTopsRepo.getMeetingTop(meetingId, topId);
  if (!mt) throw new Error("TOP ist nicht Teil dieser Besprechung");
  if (Number(mt.is_carried_over) === 1) throw new Error("Übernommener TOP kann nicht gelöscht werden");

  const top = await topsRepo.getTopById(topId);
  if (!top) throw new Error("TOP nicht gefunden");
  if (String(top.project_id) !== String(meeting.project_id)) {
    throw new Error("TOP gehört zu anderem Projekt");
  }

  if (await topsRepo.hasChildren(topId)) throw new Error("TOP hat Unterpunkte");

  await topsRepo.softDeleteTop({ topId });
  if (typeof meetingTopsRepo.deleteByTopId === "function") {
    await meetingTopsRepo.deleteByTopId(topId);
  }
  return { topId };
}
