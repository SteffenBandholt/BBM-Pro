export function normalizeProject(rawProject) {
  return {
    id: rawProject.id ?? null,
    name: rawProject.name ?? '',
    number: rawProject.number ?? '',
    city: rawProject.city ?? '',
    status: rawProject.status ?? 'geplant',
    description: rawProject.description ?? '',
    startDate: rawProject.startDate ?? '',
    endDate: rawProject.endDate ?? '',
  };
}

export function normalizeProjects(rawProjects) {
  return rawProjects.map(normalizeProject);
}
