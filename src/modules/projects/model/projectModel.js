export function normalizeProject(rawProject) {
  return {
    id: rawProject.id ?? null,
    name: rawProject.name ?? '',
    number: rawProject.number ?? '',
    city: rawProject.city ?? '',
  };
}

export function normalizeProjects(rawProjects) {
  return rawProjects.map(normalizeProject);
}
