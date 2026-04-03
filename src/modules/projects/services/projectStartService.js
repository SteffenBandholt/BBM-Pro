const LAST_PROJECT_KEY = 'bbmpro.last-project.v1';

function readStoredLastProjectId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '';
  }

  try {
    const raw = window.localStorage.getItem(LAST_PROJECT_KEY);
    if (!raw) {
      return '';
    }

    const parsed = JSON.parse(raw);
    return parsed?.projectId ? String(parsed.projectId) : '';
  } catch {
    return '';
  }
}

function writeStoredLastProjectId(projectId) {
  if (typeof window === 'undefined' || !window.localStorage || !projectId) {
    return;
  }

  window.localStorage.setItem(
    LAST_PROJECT_KEY,
    JSON.stringify({
      projectId: String(projectId),
      visitedAt: new Date().toISOString(),
    }),
  );
}

function extractYmd(rawValue) {
  const value = String(rawValue || '').trim();

  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const sliced = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(sliced) ? sliced : '';
}

export function rememberProjectVisit(projectId) {
  writeStoredLastProjectId(projectId);
}

export function getLastProjectId() {
  return readStoredLastProjectId();
}

export function formatProjectDate(rawValue) {
  const ymd = extractYmd(rawValue);

  if (!ymd) {
    return '';
  }

  const [year, month, day] = ymd.split('-');
  return `${day}.${month}.${year}`;
}

export function isArchivedProject(project) {
  return String(project?.status || '').trim().toLowerCase() === 'abgeschlossen';
}

export function getActiveProjects(projects) {
  const items = Array.isArray(projects) ? projects.filter(Boolean) : [];
  const activeProjects = items.filter((project) => !isArchivedProject(project));
  return activeProjects.length ? activeProjects : items;
}

export function getProjectLatestMeeting(meetings) {
  return Array.isArray(meetings) && meetings.length ? meetings[0] : null;
}

export function getProjectOpenMeeting(meetings) {
  if (!Array.isArray(meetings)) {
    return null;
  }

  return (
    meetings.find((meeting) => !meeting?.is_closed && String(meeting?.status || '').toLowerCase() !== 'geschlossen') ||
    null
  );
}

export function getProjectMetaLine(project) {
  const parts = [];

  if (project?.number) {
    parts.push(`Nr. ${project.number}`);
  }

  if (project?.city) {
    parts.push(project.city);
  }

  if (project?.status) {
    parts.push(project.status);
  }

  return parts.join(' - ') || 'Projekt';
}

export function getLastActivityLabel(project, latestMeeting) {
  const meetingDate = formatProjectDate(latestMeeting?.date || latestMeeting?.created_at);
  if (meetingDate) {
    return meetingDate;
  }

  return (
    formatProjectDate(
      project?.updated_at ||
        project?.updatedAt ||
        project?.created_at ||
        project?.createdAt,
    ) || ''
  );
}

export function getLatestMeetingLabel(latestMeeting) {
  if (!latestMeeting) {
    return 'Noch keine Besprechung';
  }

  const parts = [];

  if (latestMeeting.number) {
    parts.push(`Besprechung #${latestMeeting.number}`);
  } else {
    parts.push('Besprechung');
  }

  const meetingDate = formatProjectDate(latestMeeting.date || latestMeeting.created_at);
  if (meetingDate) {
    parts.push(meetingDate);
  }

  if (latestMeeting.keyword) {
    parts.push(latestMeeting.keyword);
  }

  return parts.join(' - ');
}
