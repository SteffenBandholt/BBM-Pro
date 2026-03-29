import { normalizeProject, normalizeProjects } from '../model/projectModel.js';

const fakeProjects = [
  { id: 1, name: 'Projekt A', number: 'PA-001', city: 'Berlin' },
  { id: 2, name: 'Projekt B', number: 'PB-002', city: 'Hamburg' },
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
  });

  projectsStore = [
    ...projectsStore.slice(0, index),
    updatedProject,
    ...projectsStore.slice(index + 1),
  ];

  return updatedProject;
}
