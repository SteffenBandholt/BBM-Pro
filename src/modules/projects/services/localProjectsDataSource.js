import { getRepos } from "../../../services/repositories/index.js";
import { normalizeProject, normalizeProjects } from '../model/projectModel.js';

const { projectsRepo } = getRepos();

export async function listProjects() {
  const projects = await projectsRepo.listProjects();
  return normalizeProjects(projects);
}

export async function createProject(input) {
  const createdProject = await projectsRepo.createProject(input);
  return normalizeProject(createdProject);
}

export async function updateProject(projectId, input) {
  const updatedProject = await projectsRepo.updateProject(projectId, input);
  return normalizeProject(updatedProject);
}
