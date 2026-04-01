import * as projectsRepo from "../../../services/repositories/projectsRepo.js";

export async function listProjects() {
  return projectsRepo.listProjects();
}

export async function createProject(input) {
  return projectsRepo.createProject(input);
}

export async function updateProject(projectId, input) {
  return projectsRepo.updateProject(projectId, input);
}
