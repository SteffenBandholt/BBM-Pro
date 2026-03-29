export const appModules = [
  {
    id: 'projects',
    title: 'Projekte',
    description: 'Projektübersicht und Detailnavigation.',
    href: '/projects',
    active: true,
    showInMainNav: true,
    showOnDashboard: true,
  },
  {
    id: 'defects',
    title: 'Mängelmanagement',
    description: 'In Vorbereitung.',
    active: false,
    showInMainNav: false,
    showOnDashboard: true,
  },
  {
    id: 'documents',
    title: 'Dokumente',
    description: 'In Vorbereitung.',
    active: false,
    showInMainNav: false,
    showOnDashboard: true,
  },
  {
    id: 'appointments',
    title: 'Termine',
    description: 'In Vorbereitung.',
    active: false,
    showInMainNav: false,
    showOnDashboard: true,
  },
  {
    id: 'tasks',
    title: 'Aufgaben',
    description: 'In Vorbereitung.',
    active: false,
    showInMainNav: false,
    showOnDashboard: true,
  },
];

export function getMainNavigationModules() {
  return appModules.filter((module) => module.showInMainNav && module.active);
}

export function getDashboardModules() {
  return appModules.filter((module) => module.showOnDashboard);
}
