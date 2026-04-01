import { getPrintData } from "../domain/printService.js";
import { renderProtocolPdf } from "./protocolPdfRenderer.js";
import { buildDebugProtocolData } from "./printDebugData.js";

export async function generateProtocolPdf(projectId, meetingId) {
  const data = getPrintData({ mode: "protocol", projectId, meetingId });
  const pdfBytes = await renderProtocolPdf(data);
  return pdfBytes;
}

export async function generateDebugProtocolPdf() {
  const data = buildDebugProtocolData();
  return renderProtocolPdf(data);
}
