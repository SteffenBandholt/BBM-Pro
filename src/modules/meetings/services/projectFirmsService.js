import { getRepos } from "../../../services/repositories/index.js";

const { projectFirmsRepo } = getRepos();

export async function listProjectFirms(projectId) {
  return projectFirmsRepo.ensureSampleFirms(projectId);
}
