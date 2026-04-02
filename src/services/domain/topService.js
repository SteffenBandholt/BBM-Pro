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
  if (!Number.isFinite(lv) || lv < 1 || lv > MAX_LEVEL) throw new Error("Ungueltiges Level");
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

  let lvl = Number(level) || 1;
  if (parentTopId) {
    const parent = await topsRepo.getTopById(parentTopId);
    if (!parent || String(parent.project_id) !== String(projectId)) throw new Error("Parent not found");
    lvl = Number(parent.level || 1) + 1;
  }
  lvl = ensureLevel(lvl);
  if (!parentTopId && lvl > 1) throw new Error("TOP braucht einen Titel als Parent");
  if (lvl === 1 && parentTopId) throw new Error("Root darf keinen Parent haben");
  if (lvl > MAX_LEVEL) throw new Error("Max Level 4 erreicht");

  const number = await topsRepo.getNextNumber(projectId, parentTopId || null);

  const created = await topsRepo.createTop({
    projectId,
    parentTopId: parentTopId || null,
    level: lvl,
    number,
    title,
  });

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

  if (await topsRepo.hasChildren(topId)) throw new Error("TOP hat Unterpunkte");

  const openMeeting = await meetingsRepo.getOpenMeetingByProject(top.project_id);
  if (!openMeeting) throw new Error("Kein offenes Meeting fuer dieses Projekt");

  const mt = await meetingTopsRepo.getMeetingTop(openMeeting.id, topId);
  if (!mt) throw new Error("TOP gehoert nicht zum offenen Meeting");
  if (Number(mt.is_carried_over) === 1) throw new Error("Uebernommener TOP kann nicht verschoben werden");

  let newLevel = Number(top.level);
  if (targetParentId) {
    if (String(targetParentId) === String(topId)) throw new Error("Zielparent ist derselbe TOP");
    const parent = await topsRepo.getTopById(targetParentId);
    if (!parent || String(parent.project_id) !== String(top.project_id)) {
      throw new Error("Ziel-Parent fehlt oder anderes Projekt");
    }
    const parentLevel = Number(parent.level);
    if (!Number.isFinite(parentLevel) || parentLevel < 1 || parentLevel > 4) {
      throw new Error("Ziel-Parent hat ungueltiges Level");
    }
    if (parentLevel >= MAX_LEVEL) throw new Error("Maximale Tiefe erreicht (unter Level 4 nicht erlaubt)");

    let cur = parent;
    let guard = 0;
    while (cur && guard < 100) {
      if (String(cur.id) === String(topId)) throw new Error("Zyklus nicht erlaubt");
      if (!cur.parent_top_id) break;
      cur = await topsRepo.getTopById(cur.parent_top_id);
      guard += 1;
    }

    newLevel = parentLevel + 1;
    if (newLevel > MAX_LEVEL) throw new Error("Maximale Tiefe 4 ueberschritten");
  } else {
    if (Number(top.level) !== 1) throw new Error("Nur Titel (Level 1) duerfen Root sein");
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

  if (isCarried && patch.title !== undefined) {
    throw new Error("Uebernommener TOP: Titel ist gesperrt");
  }

  if (patch.status && String(patch.status).toLowerCase() === "erledigt") {
    next.status = "erledigt";
    next.dueDate = todayYmd();
    next.completed_in_meeting_id = meetingId;
  }

  if (isCarried && detectTouched(mt, next)) {
    next.is_touched = 1;
  }

  if (next.title !== undefined) {
    await topsRepo.updateTitle({ topId, title: next.title });
  }
  if (next.is_hidden !== undefined) {
    await topsRepo.setHidden({ topId, isHidden: !!next.is_hidden });
  }

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

  const toDateString = (v) => {
    if (v == null) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    const s = String(v).trim();
    return s === "" ? null : s;
  };
  const toInt = (v) => (v === undefined || v === null ? undefined : v ? 1 : 0);
  const repoPatch = {
    meetingId,
    topId,
  };

  if (next.status !== undefined) {
    repoPatch.status = next.status;
  }

  if (next.dueDate !== undefined || patch.due_date !== undefined) {
    repoPatch.due_date = toDateString(next.dueDate ?? patch.due_date);
  }

  if (next.longtext !== undefined || patch.longtext !== undefined) {
    repoPatch.longtext = next.longtext ?? patch.longtext ?? null;
  }

  if (next.completed_in_meeting_id !== undefined) {
    repoPatch.completed_in_meeting_id = next.completed_in_meeting_id;
  }

  if (next.is_important !== undefined || patch.is_important !== undefined) {
    repoPatch.is_important = toInt(next.is_important ?? patch.is_important);
  }

  if (next.is_touched !== undefined) {
    repoPatch.is_touched = toInt(next.is_touched);
  }

  if (patch.is_task !== undefined) {
    repoPatch.is_task = toInt(patch.is_task);
  }

  if (patch.is_decision !== undefined) {
    repoPatch.is_decision = toInt(patch.is_decision);
  }

  if (
    Number(mt.level) === 1 ||
    patch.responsible_kind !== undefined ||
    patch.responsible_id !== undefined ||
    patch.responsible_label !== undefined ||
    patch.responsibleKind !== undefined ||
    patch.responsibleId !== undefined ||
    patch.responsibleLabel !== undefined
  ) {
    repoPatch.responsible_kind = next.responsible_kind ?? null;
    repoPatch.responsible_id = next.responsible_id ?? null;
    repoPatch.responsible_label = next.responsible_label ?? null;
  }

  if (patch.contact_kind !== undefined) {
    repoPatch.contact_kind = patch.contact_kind;
  }
  if (patch.contact_person_id !== undefined) {
    repoPatch.contact_person_id = patch.contact_person_id;
  }
  if (patch.contact_label !== undefined) {
    repoPatch.contact_label = patch.contact_label;
  }

  return meetingTopsRepo.updateMeetingTop(repoPatch);
}

export async function deleteTop({ meetingId, topId }) {
  if (!meetingId) throw new Error("meetingId required");
  if (!topId) throw new Error("topId required");

  const meeting = await assertOpenMeeting(meetingId);
  const mt = await meetingTopsRepo.getMeetingTop(meetingId, topId);
  if (!mt) throw new Error("TOP ist nicht Teil dieser Besprechung");
  if (Number(mt.is_carried_over) === 1) throw new Error("Uebernommener TOP kann nicht geloescht werden");

  const top = await topsRepo.getTopById(topId);
  if (!top) throw new Error("TOP nicht gefunden");
  if (String(top.project_id) !== String(meeting.project_id)) {
    throw new Error("TOP gehoert zu anderem Projekt");
  }

  if (await topsRepo.hasChildren(topId)) throw new Error("TOP hat Unterpunkte");

  await topsRepo.softDeleteTop({ topId });
  if (typeof meetingTopsRepo.deleteByTopId === "function") {
    await meetingTopsRepo.deleteByTopId(topId);
  }
  return { topId };
}
