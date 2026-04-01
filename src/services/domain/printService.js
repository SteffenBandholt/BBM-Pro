import * as projectsRepo from "../repositories/projectsRepo.js";
import * as meetingsRepo from "../repositories/meetingsRepo.js";
import * as meetingTopsRepo from "../repositories/meetingTopsRepo.js";
import * as projectFirmsRepo from "../repositories/projectFirmsRepo.js";
import * as meetingParticipantsRepo from "../repositories/meetingParticipantsRepo.js";

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

function normalizeTop(row, isClosed, displayMap) {
  const useFrozen = isClosed;
  const title = useFrozen && row.frozen_title != null ? row.frozen_title : row.title;
  const parent = useFrozen && row.frozen_parent_top_id !== undefined && row.frozen_parent_top_id !== null
    ? row.frozen_parent_top_id
    : row.parent_top_id;
  const level = useFrozen && row.frozen_level != null ? row.frozen_level : row.level;
  const number = useFrozen && row.frozen_number != null ? row.frozen_number : row.number;
  const displayNumber = useFrozen && row.frozen_display_number
    ? row.frozen_display_number
    : displayMap.get(String(row.id)) || String(number || "");
  const isHidden = useFrozen && row.frozen_is_hidden != null ? row.frozen_is_hidden : row.is_hidden;
  const ampel = useFrozen && row.frozen_ampel_color !== undefined
    ? { color: row.frozen_ampel_color, reason: row.frozen_ampel_reason }
    : computeAmpel(row.status, row.due_date);

  return {
    id: row.id,
    projectId: row.project_id,
    meetingId: row.meeting_id,
    parentTopId: parent,
    level,
    number,
    displayNumber,
    title: title || "",
    longtext: row.longtext || "",
    status: row.status || "offen",
    dueDate: row.due_date || null,
    isHidden: !!isHidden,
    isTrashed: !!row.is_trashed,
    isCarriedOver: !!row.is_carried_over,
    isTask: !!row.is_task,
    isDecision: !!row.is_decision,
    isImportant: !!row.is_important,
    responsibleKind: row.responsible_kind || null,
    responsibleId: row.responsible_id || null,
    responsibleLabel: row.responsible_label || null,
    ampelColor: ampel.color,
    ampelReason: ampel.reason,
  };
}

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

function buildTree(nodes) {
  const byParent = new Map();
  nodes.forEach((n) => {
    const parent = n.parentTopId ? String(n.parentTopId) : null;
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(n);
  });
  const sort = (list) =>
    list.sort((a, b) => {
      const ap = String(a.displayNumber).split(".").map(Number);
      const bp = String(b.displayNumber).split(".").map(Number);
      const len = Math.max(ap.length, bp.length);
      for (let i = 0; i < len; i++) {
        const av = ap[i] ?? -1;
        const bv = bp[i] ?? -1;
        if (av !== bv) return av - bv;
      }
      return 0;
    });
  const walk = (parentId) => {
    const list = sort((byParent.get(parentId) || []).slice());
    return list.map((item) => ({
      ...item,
      children: walk(item.id),
    }));
  };
  return walk(null);
}

function filterVisible(rows) {
  return rows.filter((r) => !r.is_trashed && !r.removed_at && !r.is_hidden);
}

function mapParticipants(meetingId) {
  const list = meetingParticipantsRepo.listMeetingParticipants(meetingId);
  return list.map((p) => {
    const firm = projectFirmsRepo.getById(p.firm_id);
    return {
      kind: "firm",
      firmId: p.firm_id,
      firmName: firm?.name || "",
      isPresent: !!p.is_present,
      isInDistribution: !!p.is_in_distribution,
    };
  });
}

export function getPrintData({ mode, projectId, meetingId }) {
  const project = projectId ? projectsRepo.getProjectById(projectId) : null;
  const meeting = meetingId ? meetingsRepo.getMeetingById(meetingId) : null;
  if (!project || !meeting) {
    throw new Error("Projekt oder Meeting nicht gefunden");
  }

  const isClosed = !!meeting.is_closed;
  const rows = meetingTopsRepo.listJoinedByMeeting(meetingId);
  const visibleRows = filterVisible(rows);
  const displayMap = buildDisplayNumbers(visibleRows);
  const normalized = visibleRows.map((r) => normalizeTop(r, isClosed, displayMap));

  const tree = buildTree(normalized);
  const participants = mapParticipants(meetingId);

  const base = {
    mode,
    generated_at: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      number: project.number || "",
      city: project.city || "",
    },
    meeting: {
      id: meeting.id,
      title: meeting.title || "",
      index: meeting.meeting_index,
      is_closed: !!meeting.is_closed,
      created_at: meeting.created_at,
      updated_at: meeting.updated_at,
    },
    participants,
  };

  if (mode === "todo") {
    const items = normalized.filter((t) => t.status !== "erledigt");
    return { ...base, tops: items };
  }

  if (mode === "toplist") {
    return { ...base, tops: tree };
  }

  // default: protocol
  return { ...base, tops: tree };
}
