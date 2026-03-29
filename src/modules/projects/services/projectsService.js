import { getProjectsDataSource } from './projectsDataSource.js';

const projectsDataSource = getProjectsDataSource();

export async function listProjects() {
  return projectsDataSource.listProjects();
}

export async function createProject(input) {
  return projectsDataSource.createProject(input);
}
