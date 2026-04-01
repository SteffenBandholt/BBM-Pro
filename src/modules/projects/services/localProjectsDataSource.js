import { getRepos } from "../../../services/repositories/index.js";

const { projectsRepo } = getRepos();

export async function listProjects() {
  return projectsRepo.listProjects();
}

export async function createProject(input) {
  return projectsRepo.createProject(input);
}

export async function updateProject(projectId, input) {
  return projectsRepo.updateProject(projectId, input);
}
