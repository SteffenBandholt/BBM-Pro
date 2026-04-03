export function normalizeProject(rawProject) {
  return {
    id: rawProject.id ?? null,
    name: rawProject.name ?? '',
    number: rawProject.number ?? '',
    city: rawProject.city ?? '',
    status: rawProject.status ?? 'geplant',
    description: rawProject.description ?? '',
    startDate: rawProject.startDate ?? rawProject.start_date ?? '',
    endDate: rawProject.endDate ?? rawProject.end_date ?? '',
    createdAt: rawProject.createdAt ?? rawProject.created_at ?? '',
    updatedAt: rawProject.updatedAt ?? rawProject.updated_at ?? '',
  };
}

export function normalizeProjects(rawProjects) {
  return rawProjects.map(normalizeProject);
}
