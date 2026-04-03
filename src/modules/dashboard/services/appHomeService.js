import { listMeetings } from '../../meetings/services/meetingsService.js';
import { listProjects } from '../../projects/services/projectsService.js';
import {
  getActiveProjects,
  getLastActivityLabel,
  getLastProjectId,
  getLatestMeetingLabel,
  getProjectLatestMeeting,
  getProjectMetaLine,
} from '../../projects/services/projectStartService.js';

function sortProjectsForHome(projects, rememberedProjectId) {
  if (!rememberedProjectId) {
    return projects;
  }

  return [...projects].sort((left, right) => {
    if (String(left.id) === rememberedProjectId) {
      return -1;
    }

    if (String(right.id) === rememberedProjectId) {
      return 1;
    }

    return 0;
  });
}

function buildProjectSummary(project, meetings, rememberedProjectId) {
  const latestMeeting = getProjectLatestMeeting(meetings);

  return {
    id: project.id,
    name: project.name || 'Projekt',
    number: project.number || '',
    city: project.city || '',
    status: project.status || '',
    metaLine: getProjectMetaLine(project),
    lastActivityLabel: getLastActivityLabel(project, latestMeeting),
    latestMeetingLabel: getLatestMeetingLabel(latestMeeting),
    isRemembered: String(project.id) === String(rememberedProjectId || ''),
  };
}

function buildProjectManagementActions(lastProject) {
  const actions = [
    {
      id: 'projects',
      title: 'Projektuebersicht',
      description: 'Alle Projekte oeffnen und gezielt wechseln.',
      href: '/projects',
    },
    {
      id: 'create-project',
      title: 'Neues Projekt anlegen',
      description: 'Selten benoetigt, aber direkt erreichbar.',
      href: '/projects?mode=create',
    },
  ];

  if (lastProject) {
    actions.splice(1, 0, {
      id: 'edit-project',
      title: 'Projekt bearbeiten',
      description: 'Zuletzt geoeffnetes Projekt in den Stammdaten pflegen.',
      href: `/projects/${lastProject.id}?mode=edit`,
    });
  }

  return actions;
}

export async function loadAppHome() {
  const projects = await listProjects();
  const rememberedProjectId = getLastProjectId();
  const activeProjectsBase = getActiveProjects(projects);

  const projectContexts = await Promise.all(
    activeProjectsBase.map(async (project) => ({
      project,
      meetings: await listMeetings(project.id),
    })),
  );

  const activeProjects = sortProjectsForHome(
    projectContexts.map(({ project, meetings }) =>
      buildProjectSummary(project, meetings, rememberedProjectId),
    ),
    rememberedProjectId,
  );

  const lastProject =
    activeProjects.find((project) => project.isRemembered) ||
    activeProjects[0] ||
    null;

  return {
    lastProject,
    activeProjects,
    projectManagement: buildProjectManagementActions(lastProject),
    masterData: [
      {
        id: 'firms',
        title: 'Firmen',
        description: 'Globale Firmen- und Ansprechpartnerdaten pflegen.',
        href: '/firms',
      },
    ],
  };
}
