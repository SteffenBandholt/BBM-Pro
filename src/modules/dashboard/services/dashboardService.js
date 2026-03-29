import { listProjects } from '../../projects/services/projectsService.js';
import { dashboardModules } from '../data/dashboardModules.js';

export async function loadDashboard() {
  const projects = await listProjects();

  return {
    modules: dashboardModules,
    projects,
  };
}
