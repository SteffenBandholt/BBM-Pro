import { normalizeProject, normalizeProjects } from '../model/projectModel.js';

const fakeProjects = [
  {
    id: 1,
    name: 'Projekt A',
    number: 'PA-001',
    city: 'Berlin',
    status: 'laufend',
    description: 'Umbau eines Bürostandorts mit mehreren Bauabschnitten.',
    startDate: '2025-01-15',
    endDate: '2025-08-30',
  },
  {
    id: 2,
    name: 'Projekt B',
    number: 'PB-002',
    city: 'Hamburg',
    status: 'geplant',
    description: 'Neubau eines kleineren Verwaltungsgebäudes.',
    startDate: '2025-04-01',
    endDate: '2025-12-15',
  },
];

let projectsStore = [...fakeProjects];
let nextId = 3;

export async function listProjects() {
  return normalizeProjects(projectsStore);
}

export async function createProject(input) {
  const createdProject = normalizeProject({
    id: nextId,
    name: input.name,
    number: input.number,
    city: input.city,
    status: input.status,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  projectsStore = [createdProject, ...projectsStore];
  nextId += 1;

  return createdProject;
}

export async function updateProject(projectId, input) {
  const index = projectsStore.findIndex((project) => String(project.id) === String(projectId));

  if (index === -1) {
    throw new Error('Projekt konnte nicht gefunden werden.');
  }

  const updatedProject = normalizeProject({
    ...projectsStore[index],
    ...input,
    id: projectsStore[index].id,
    status: input.status ?? projectsStore[index].status,
    description: input.description ?? projectsStore[index].description,
    startDate: input.startDate ?? projectsStore[index].startDate,
    endDate: input.endDate ?? projectsStore[index].endDate,
  });

  projectsStore = [
    ...projectsStore.slice(0, index),
    updatedProject,
    ...projectsStore.slice(index + 1),
  ];

  return updatedProject;
}
