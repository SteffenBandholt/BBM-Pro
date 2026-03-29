import { listProjects } from '../../projects/services/projectsService.js';
import { getDashboardModules } from '../../../app/config/appModules.js';

export async function loadDashboard() {
  const projects = await listProjects();

  return {
    modules: getDashboardModules(),
    projects,
  };
}
