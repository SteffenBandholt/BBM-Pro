import { computeDisplayNumbers } from '../../../services/tops/displayNumber.js';

const TOP_STATUS_OPTIONS = [
  'neu',
  'übernommen',
  'geändert',
  'erledigt',
  'hidden',
  'trashed',
  'offen',
  'in arbeit',
  'blockiert',
  'verzug',
];
const TOP_STATUS_VALUES = new Set(TOP_STATUS_OPTIONS);
const DEFAULT_CREATED_AT = new Date().toISOString().slice(0, 10);

const initialMeetingTops = [
  {
    id: 'top-1',
    title: 'Projektstart',
    longtext: 'Kickoff und erste Abstimmungen.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'neu',
    isCarriedOver: false,
    isHidden: false,
    isTrashed: false,
    isTouched: false,
    isImportant: true,
    level: 1,
    parentTopId: null,
    number: 1,
  },
  {
    id: 'top-2',
    title: 'Übernommene Punkte',
    longtext: 'Aus der vorherigen Besprechung übernommen.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'übernommen',
    isCarriedOver: true,
    isHidden: false,
    isTrashed: false,
    isTouched: false,
    isImportant: false,
    level: 1,
    parentTopId: null,
    number: 2,
  },
  {
    id: 'top-3',
    title: 'Zufahrt klären',
    longtext: 'Abstimmung mit der Bauleitung.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'geändert',
    isCarriedOver: true,
    isHidden: false,
    isTrashed: false,
    isTouched: true,
    isImportant: false,
    level: 2,
    parentTopId: 'top-2',
    number: 1,
  },
  {
    id: 'top-4',
    title: 'Terminplanung',
    longtext: 'Folgetermin mit allen Beteiligten abstimmen.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'neu',
    isCarriedOver: false,
    isHidden: false,
    isTrashed: false,
    isTouched: false,
    isImportant: false,
    level: 1,
    parentTopId: null,
    number: 3,
  },
  {
    id: 'top-5',
    title: 'Folgetermin festlegen',
    longtext: 'Termin für die nächste Runde definieren.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'neu',
    isCarriedOver: false,
    isHidden: false,
    isTrashed: false,
    isTouched: false,
    isImportant: false,
    level: 2,
    parentTopId: 'top-4',
    number: 1,
  },
  {
    id: 'top-6',
    title: 'Teilnehmerliste prüfen',
    longtext: 'Aktive Beteiligte bestätigen.',
    dueDate: null,
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    status: 'neu',
    isCarriedOver: false,
    isHidden: false,
    isTrashed: false,
    isTouched: false,
    isImportant: false,
    level: 3,
    parentTopId: 'top-5',
    number: 1,
  },
];

function createTopId() {
  return `top-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTop(top) {
  const lifecycleStatus = TOP_STATUS_VALUES.has(top.status)
    ? top.status
    : top.isTrashed
      ? 'trashed'
      : top.isHidden
        ? 'hidden'
        : top.isCarriedOver
          ? top.isTouched
            ? 'geändert'
            : 'übernommen'
          : 'neu';

  return {
    id: top.id,
    title: top.title ?? '',
    longtext: top.longtext ?? '',
    dueDate: top.dueDate ?? null,
    responsibleId: top.responsibleId ?? top.responsible_id ?? null,
    responsibleKind: top.responsibleKind ?? top.responsible_kind ?? null,
    responsibleLabel: top.responsibleLabel ?? top.responsible_label ?? '',
    createdAt: top.createdAt ?? DEFAULT_CREATED_AT,
    ampel: top.ampel ?? 'gelb',
    status: lifecycleStatus,
    isCarriedOver: Boolean(top.isCarriedOver),
    isHidden: lifecycleStatus === 'hidden' || Boolean(top.isHidden),
    isTrashed: lifecycleStatus === 'trashed' || Boolean(top.isTrashed),
    isTouched:
      lifecycleStatus === 'geändert' || Boolean(top.isTouched && (top.isCarriedOver || lifecycleStatus === 'geändert')),
    isImportant: Boolean(top.isImportant),
    level: top.level ?? 1,
    parentTopId: top.parentTopId ?? null,
    parent_top_id: top.parentTopId ?? null,
    number: top.number ?? 1,
  };
}

function compareTopOrder(a, b) {
  if (a.number !== b.number) {
    return a.number - b.number;
  }

  return String(a.id).localeCompare(String(b.id), 'de');
}

function isTopVisible(top) {
  return !top.isHidden && !top.isTrashed;
}

function buildTopIndex(tops) {
  return tops.reduce((index, top) => {
    const normalizedTop = normalizeTop(top);
    const parentId = normalizedTop.parentTopId ?? null;

    if (!index.has(parentId)) {
      index.set(parentId, []);
    }

    index.get(parentId).push(normalizedTop);
    return index;
  }, new Map());
}

function flattenTopTree(nodes, flattened = []) {
  nodes.forEach((node) => {
    flattened.push(node);
    flattenTopTree(node.children ?? [], flattened);
  });

  return flattened;
}

function getDescendantIdsFromIndex(index, topId, visited = new Set()) {
  const children = index.get(topId) ?? [];
  const descendantIds = new Set();

  if (visited.has(topId)) {
    return descendantIds;
  }

  visited.add(topId);

  children.forEach((child) => {
    descendantIds.add(child.id);
    getDescendantIdsFromIndex(index, child.id, visited).forEach((descendantId) => {
      descendantIds.add(descendantId);
    });
  });

  return descendantIds;
}

function reindexMeetingTops(tops) {
  const normalizedTops = tops.map(normalizeTop);
  const index = buildTopIndex(normalizedTops);

  const walk = (parentTopId, level, lineage = new Set()) => {
    if (level > 4) {
      return [];
    }

    const siblings = (index.get(parentTopId ?? null) ?? []).slice().sort(compareTopOrder);

    return siblings.flatMap((sibling, siblingIndex) => {
      if (lineage.has(sibling.id)) {
        return [];
      }

      const updatedSibling = {
        ...sibling,
        parentTopId: parentTopId ?? null,
        level,
        number: siblingIndex + 1,
      };

      const nextLineage = new Set(lineage);
      nextLineage.add(updatedSibling.id);

      return [updatedSibling, ...walk(updatedSibling.id, level + 1, nextLineage)];
    });
  };

  return walk(null, 1);
}

export function createInitialMeetingTops() {
  return initialMeetingTops.map(normalizeTop);
}

export function createEmptyTopDraft() {
  return {
    title: '',
    longtext: '',
    dueDate: '',
    createdAt: DEFAULT_CREATED_AT,
    ampel: 'gelb',
    responsibleId: '',
    status: 'neu',
    isImportant: false,
    isHidden: false,
  };
}

export function buildMeetingTopTree(tops) {
  const normalizedTops = tops.map(normalizeTop);
  const displayMap = computeDisplayNumbers(normalizedTops);
  const index = buildTopIndex(normalizedTops);

  const walk = (parentTopId, lineage = new Set()) =>
    (index.get(parentTopId ?? null) ?? [])
      .slice()
      .sort(compareTopOrder)
      .filter((top) => isTopVisible(top))
      .map((top) => {
        if (lineage.has(top.id)) {
          return null;
        }

        const displayNumber = displayMap.get(String(top.id)) || `${top.number}`;
        const nextLineage = new Set(lineage);
        nextLineage.add(top.id);

        return {
          ...top,
          displayNumber,
          children: walk(top.id, nextLineage).filter(Boolean),
        };
      })
      .filter(Boolean);

  return walk(null);
}

export function findMeetingTopNodeById(nodes, topId) {
  for (const node of nodes) {
    if (node.id === topId) {
      return node;
    }

    const foundChild = findMeetingTopNodeById(node.children ?? [], topId);
    if (foundChild) {
      return foundChild;
    }
  }

  return null;
}

export function getMeetingTopById(tops, topId) {
  return tops.find((top) => top.id === topId) ?? null;
}

export function hasMeetingTopChildren(tops, topId) {
  return tops.some((top) => top.parentTopId === topId);
}

export function addMeetingTop(tops, draft) {
  const parentTopId = draft.parentTopId ?? null;
  const parentTop = parentTopId ? getMeetingTopById(tops, parentTopId) : null;

  if (parentTopId && (!parentTop || !isTopVisible(parentTop) || parentTop.level >= 4)) {
    return tops;
  }

  const level = parentTop ? parentTop.level + 1 : 1;

  if (level > 4) {
    return tops;
  }

  const siblingNumbers = tops
    .filter((top) => (top.parentTopId ?? null) === parentTopId)
    .map((top) => top.number);

  const newTop = normalizeTop({
    id: createTopId(),
    title: draft.title ?? '',
    longtext: draft.longtext ?? '',
    dueDate: draft.dueDate || null,
    createdAt: draft.createdAt || DEFAULT_CREATED_AT,
    ampel: draft.ampel ?? 'gelb',
    responsibleId: draft.responsibleId ?? null,
    responsibleKind: draft.responsibleKind ?? null,
    responsibleLabel: draft.responsibleLabel ?? '',
    status: draft.isHidden
      ? 'hidden'
      : TOP_STATUS_VALUES.has(draft.status)
        ? draft.status
        : 'neu',
    isCarriedOver: false,
    isHidden: Boolean(draft.isHidden) || draft.status === 'hidden',
    isTrashed: false,
    isTouched: false,
    isImportant: Boolean(draft.isImportant),
    level,
    parentTopId,
    number: siblingNumbers.length ? Math.max(...siblingNumbers) + 1 : 1,
  });

  return reindexMeetingTops([...tops, newTop]);
}

export function updateMeetingTop(tops, topId, draft) {
  return tops.map((top) => {
    if (top.id !== topId) {
      return top;
    }

    const nextTitle = top.isCarriedOver ? top.title : draft.title ?? '';
    const draftStatus = TOP_STATUS_VALUES.has(draft.status) ? draft.status : top.status;
    const hasChanged =
      top.title !== nextTitle ||
      top.longtext !== (draft.longtext ?? '') ||
      top.dueDate !== (draft.dueDate || null) ||
      top.isHidden !== Boolean(draft.isHidden) ||
      top.isImportant !== Boolean(draft.isImportant);
    const nextStatus = draft.isHidden
      ? 'hidden'
      : top.isCarriedOver && hasChanged && (draftStatus === 'neu' || draftStatus === 'übernommen')
        ? 'geändert'
        : draftStatus;
    const nextTop = normalizeTop({
      ...top,
      title: nextTitle,
      longtext: draft.longtext ?? '',
      dueDate: draft.dueDate || null,
      responsibleId: draft.responsibleId ?? top.responsibleId ?? top.responsible_id ?? null,
      responsibleKind: draft.responsible_kind ?? draft.responsibleKind ?? top.responsibleKind ?? top.responsible_kind ?? null,
      responsibleLabel: draft.responsible_label ?? draft.responsibleLabel ?? top.responsibleLabel ?? top.responsible_label ?? '',
      ampel: draft.ampel ?? top.ampel ?? 'gelb',
      status: nextStatus,
      isHidden: Boolean(draft.isHidden) || nextStatus === 'hidden',
      isTrashed: nextStatus === 'trashed',
      isImportant: Boolean(draft.isImportant),
      level: top.level,
      parentTopId: top.parentTopId,
      number: top.number,
    });

    const changed =
      top.title !== nextTop.title ||
      top.longtext !== nextTop.longtext ||
      top.dueDate !== nextTop.dueDate ||
      top.status !== nextTop.status ||
      top.isHidden !== nextTop.isHidden ||
      top.isTrashed !== nextTop.isTrashed ||
      top.isImportant !== nextTop.isImportant;

    return {
      ...nextTop,
      isTouched: top.isCarriedOver ? top.isTouched || changed || nextTop.status === 'geändert' : false,
    };
  });
}

export function deleteMeetingTop(tops, topId) {
  const top = getMeetingTopById(tops, topId);
  if (!top || !isTopVisible(top) || top.isCarriedOver || hasMeetingTopChildren(tops, topId)) {
    return tops;
  }

  return reindexMeetingTops(tops.filter((top) => top.id !== topId));
}

export function moveMeetingTop(tops, topId, targetParentId) {
  const movingTop = getMeetingTopById(tops, topId);
  if (!movingTop) {
    return tops;
  }

  if (movingTop.isCarriedOver || hasMeetingTopChildren(tops, topId)) {
    return tops;
  }

  const normalizedTargetParentId = targetParentId ?? null;
  const targetParent = normalizedTargetParentId ? getMeetingTopById(tops, normalizedTargetParentId) : null;
  const descendantIds = getDescendantIdsFromIndex(buildTopIndex(tops), topId);

  if (normalizedTargetParentId === null) {
    // Root-Ziel ist für Blattknoten aus tieferen Ebenen erlaubt.
  } else {
    if (
      !targetParent ||
      !isTopVisible(targetParent) ||
      targetParent.level >= 4 ||
      targetParent.id === movingTop.id
    ) {
      return tops;
    }

    if (descendantIds.has(targetParent.id)) {
      return tops;
    }
  }

  const siblingNumbers = tops
    .filter((top) => (top.parentTopId ?? null) === normalizedTargetParentId && top.id !== topId)
    .map((top) => top.number);

  const nextNumber = siblingNumbers.length ? Math.max(...siblingNumbers) + 1 : 1;
  const nextLevel = targetParent ? targetParent.level + 1 : 1;

  const updatedTops = tops.map((top) =>
    top.id === topId
      ? {
          ...top,
          parentTopId: normalizedTargetParentId,
          level: nextLevel,
          number: nextNumber,
          responsibleId: top.responsibleId ?? top.responsible_id ?? null,
          responsibleKind: top.responsibleKind ?? top.responsible_kind ?? null,
          responsibleLabel: top.responsibleLabel ?? top.responsible_label ?? '',
        }
      : top,
  );

  return reindexMeetingTops(updatedTops);
}

export function canDeleteMeetingTop(tops, topId, isMeetingClosed) {
  const top = getMeetingTopById(tops, topId);
  return Boolean(
    top &&
      isTopVisible(top) &&
      !isMeetingClosed &&
      !top.isCarriedOver &&
      !hasMeetingTopChildren(tops, topId),
  );
}

export function canMoveMeetingTop(tops, topId, isMeetingClosed, targetParentId) {
  const top = getMeetingTopById(tops, topId);
  if (!top || !isTopVisible(top) || isMeetingClosed || top.isCarriedOver || hasMeetingTopChildren(tops, topId)) {
    return false;
  }

  const normalizedTargetParentId = targetParentId ?? null;

  if (normalizedTargetParentId === null) {
    return !top.isCarriedOver;
  }

  const targetParent = getMeetingTopById(tops, normalizedTargetParentId);
  if (!targetParent || !isTopVisible(targetParent) || targetParent.level >= 4 || targetParent.id === top.id) {
    return false;
  }

  const descendantIds = getDescendantIdsFromIndex(buildTopIndex(tops), topId);
  return !descendantIds.has(targetParent.id);
}

export function getMeetingTopMoveTargetOptions(tops, topId) {
  const top = getMeetingTopById(tops, topId);
  if (!top || !isTopVisible(top) || top.isCarriedOver || hasMeetingTopChildren(tops, topId)) {
    return [];
  }

  const tree = buildMeetingTopTree(tops);
  const flattenedTree = flattenTopTree(tree);
  const descendantIds = getDescendantIdsFromIndex(buildTopIndex(tops), topId);
  const options = [];

  options.push({
    value: '',
    label: 'Root-Ebene',
  });

  flattenedTree.forEach((candidate) => {
    if (candidate.id === top.id || candidate.level >= 4 || descendantIds.has(candidate.id)) {
      return;
    }

    options.push({
      value: candidate.id,
      label: `${candidate.displayNumber} ${candidate.title}`,
    });
  });

  return options;
}

export { TOP_STATUS_OPTIONS };
