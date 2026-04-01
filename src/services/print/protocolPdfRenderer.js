import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  wrapText,
  drawLines,
  MM,
  PAGE,
  MARGINS,
  HEAD_HEIGHT,
  FOOT_HEIGHT,
  addHeader,
  addFooter,
  initState,
  availableSpace,
  ensureSpace,
} from "./pdfShared.js";

const FONTS = {
  body: { size: 10.5 },
  meta: { size: 9.5 },
  title: { size: 13 },
  h1: { size: 16 },
};

function renderInfoBlock(state, data) {
  const { page, fonts } = state;
  const blockHeight = 36;
  ensureSpace(state, data, blockHeight);
  page.drawText(data.project.name || "Projekt", { x: MARGINS.left, y: state.y, size: FONTS.h1.size, font: fonts.body });
  page.drawText(`Besprechung #${data.meeting.index || ""}`, {
    x: MARGINS.left,
    y: state.y - 16,
    size: FONTS.title.size,
    font: fonts.body,
  });
  page.drawText(`Datum: ${(data.meeting.created_at || "").slice(0, 10)}`, {
    x: MARGINS.left,
    y: state.y - 32,
    size: FONTS.meta.size,
    font: fonts.meta,
  });
  state.y -= blockHeight;
}

function renderParticipants(state, data) {
  const { page, fonts } = state;
  if (!data.participants || data.participants.length === 0) return;
  const titleHeight = 14;
  ensureSpace(state, data, titleHeight + 12);
  page.drawText("Teilnehmer", { x: MARGINS.left, y: state.y, size: FONTS.title.size, font: fonts.body });
  state.y -= titleHeight;
  const twoCols = data.participants.length > 14;
  const colWidth = twoCols ? (PAGE.width - MARGINS.left - MARGINS.right) / 2 - 6 : PAGE.width - MARGINS.left - MARGINS.right;
  const rows = twoCols ? Math.ceil(data.participants.length / 2) : data.participants.length;
  for (let r = 0; r < rows; r += 1) {
    ensureSpace(state, data, 12);
    const leftIdx = r;
    const rightIdx = twoCols ? r + rows : null;
    const drawEntry = (p, x) => {
      if (!p) return;
      const flags = [
        p.isPresent ? "anwesend" : null,
        p.isInDistribution ? "Verteiler" : null,
      ].filter(Boolean).join(", ");
      const line = `${p.firmName || ""}${flags ? " · " + flags : ""}`;
      const wrapped = wrapText(line, fonts.meta, FONTS.meta.size, colWidth);
      const newY = drawLines(state.page, wrapped, { x, y: state.y, size: FONTS.meta.size, font: fonts.meta, lineGap: 1.5 });
      return newY;
    };
    let nextY = state.y;
    nextY = Math.min(nextY, drawEntry(data.participants[leftIdx], MARGINS.left) ?? nextY);
    if (twoCols) {
      nextY = Math.min(nextY, drawEntry(data.participants[rightIdx], MARGINS.left + colWidth + 12) ?? nextY);
    }
    state.y = nextY - 4;
  }
  state.y -= 6;
}

function renderTop(state, data, top) {
  const { page, fonts } = state;
  const indent = (top.level - 1) * 10;
  const x = MARGINS.left + indent;
  const maxWidth = PAGE.width - MARGINS.right - x;

  // wrap title and meta to measure height
  const titleSize = top.level === 1 ? FONTS.title.size : FONTS.body.size + 1;
  const titleLines = wrapText(`${top.displayNumber || ""} ${top.title}`, fonts.body, titleSize, maxWidth);

  const metaParts = [];
  if (top.status) metaParts.push(`Status: ${top.status}`);
  if (top.dueDate) metaParts.push(`Fällig: ${top.dueDate}`);
  if (top.responsibleLabel) metaParts.push(`Verantw.: ${top.responsibleLabel}`);
  if (top.ampelColor) metaParts.push(`Ampel: ${top.ampelColor}`);
  const metaLines = wrapText(metaParts.join(" · "), fonts.meta, FONTS.meta.size, maxWidth);

  const longLines = wrapText(top.longtext, fonts.body, FONTS.body.size, maxWidth);

  const estimatedHeight =
    titleLines.length * (titleSize + 2) +
    metaLines.length * (FONTS.meta.size + 2) +
    Math.max(longLines.length, 1) * (FONTS.body.size + 2) +
    6;

  const forceNewPageForLevel1 = top.level === 1 && availableSpace(state) < estimatedHeight + 10;
  ensureSpace(state, data, estimatedHeight, forceNewPageForLevel1);

  const color =
    top.isCarriedOver && top.status === "erledigt" && !top.isTouched
      ? rgb(0.4, 0.4, 0.4)
      : rgb(0, 0, 0);

  state.y = drawLines(page, titleLines, { x, y: state.y, size: titleSize, font: fonts.body, lineGap: 2, color });
  state.y = drawLines(page, metaLines, { x, y: state.y + 2, size: FONTS.meta.size, font: fonts.meta, lineGap: 2 });
  state.y = drawLines(page, longLines, {
    x,
    y: state.y + 2,
    size: FONTS.body.size,
    font: fonts.body,
    lineGap: 2,
  });
  state.y -= 6;
}

function renderTopTree(state, data, nodes) {
  nodes.forEach((node) => {
    renderTop(state, data, node);
    if (node.children && node.children.length) {
      renderTopTree(state, data, node.children);
    }
  });
}

export async function renderProtocolPdf(printData) {
  if (printData.mode !== "protocol") {
    throw new Error("renderProtocolPdf supports only protocol mode");
  }

  const doc = await PDFDocument.create();
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const metaFont = await doc.embedFont(StandardFonts.Helvetica);
  const fonts = { body: bodyFont, meta: metaFont };

  const state = initState(doc, fonts);
  addHeader(state, printData, true);
  renderInfoBlock(state, printData);
  renderParticipants(state, printData);
  renderTopTree(state, printData, printData.tops || []);
  addFooter(state);

  const pdfBytes = await doc.save();
  return pdfBytes;
}
