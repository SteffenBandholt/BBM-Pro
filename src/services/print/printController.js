import { getPrintData } from "../domain/printService.js";
import { renderProtocolPdf } from "./protocolPdfRenderer.js";
import { renderTodoPdf } from "./todoPdfRenderer.js";
import { renderToplistPdf } from "./toplistPdfRenderer.js";
import { buildDebugProtocolData } from "./printDebugData.js";

export async function generateProtocolPdf(projectId, meetingId) {
  const data = await getPrintData({ mode: "protocol", projectId, meetingId });
  const pdfBytes = await renderProtocolPdf(data);
  return pdfBytes;
}

export async function generateDebugProtocolPdf() {
  const data = buildDebugProtocolData();
  return renderProtocolPdf(data);
}

export async function generateTodoPdf(projectId, meetingId) {
  const data = await getPrintData({ mode: "todo", projectId, meetingId });
  const pdfBytes = await renderTodoPdf(data);
  return pdfBytes;
}

export async function generateToplistPdf(projectId, meetingId) {
  const data = await getPrintData({ mode: "toplist", projectId, meetingId });
  const pdfBytes = await renderToplistPdf(data);
  return pdfBytes;
}
