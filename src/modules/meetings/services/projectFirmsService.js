import * as projectFirmsRepo from "../../../services/repositories/projectFirmsRepo.js";

export async function listProjectFirms(projectId) {
  return projectFirmsRepo.ensureSampleFirms(projectId);
}
