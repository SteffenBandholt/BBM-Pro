import { PDFDocument } from "pdf-lib";
import {
  wrapText,
  drawLines,
  PAGE,
  MARGINS,
  HEAD_HEIGHT,
  addHeader,
  addFooter,
  initState,
  availableSpace,
  ensureSpace,
  loadDefaultFonts,
} from "./pdfShared.js";

const FONTS = {
  titleL1: 13,
  title: 11,
  meta: 9.5,
};

const META_KEYS = ["status", "dueDate", "ampelColor", "responsibleLabel"];

function renderTop(state, data, node) {
  const { page, fonts } = state;
  const indent = (node.level - 1) * 10;
  const x = MARGINS.left + indent;
  const maxWidth = PAGE.width - MARGINS.right - x;

  const titleSize = node.level === 1 ? FONTS.titleL1 : FONTS.title;
  const titleLines = wrapText(`${node.displayNumber || ""} ${node.title || ""}`, fonts.body, titleSize, maxWidth);

  const metaParts = [];
  META_KEYS.forEach((k) => {
    const v = node[k];
    if (v) {
      if (k === "ampelColor") metaParts.push(`Ampel: ${v}`);
      else if (k === "responsibleLabel") metaParts.push(`Verantw.: ${v}`);
      else if (k === "dueDate") metaParts.push(`Fällig: ${v}`);
      else metaParts.push(`${k.charAt(0).toUpperCase()}${k.slice(1)}: ${v}`);
    }
  });
  const metaLines = wrapText(metaParts.join(" · "), fonts.meta, FONTS.meta, maxWidth);

  const estimatedHeight =
    titleLines.length * (titleSize + 2) + metaLines.length * (FONTS.meta + 2) + 6;
  const forceLevel1NewPage = node.level === 1 && availableSpace(state) < estimatedHeight + 10;
  ensureSpace(state, data, estimatedHeight, forceLevel1NewPage);

  const color =
    node.isCarriedOver && node.status === "erledigt" && !node.isTouched ? [0.4, 0.4, 0.4] : [0, 0, 0];
  state.y = drawLines(page, titleLines, { x, y: state.y, size: titleSize, font: fonts.body, lineGap: 2, color });
  state.y = drawLines(page, metaLines, { x, y: state.y + 2, size: FONTS.meta, font: fonts.meta, lineGap: 2 });
  state.y -= 6;
}

function renderTree(state, data, nodes) {
  nodes.forEach((n) => {
    renderTop(state, data, n);
    if (n.children && n.children.length) {
      renderTree(state, data, n.children);
    }
  });
}

export async function renderToplistPdf(printData) {
  if (printData.mode !== "toplist") {
    throw new Error("renderToplistPdf supports only toplist mode");
  }

  const doc = await PDFDocument.create();
  const fonts = await loadDefaultFonts(doc);
  const state = initState(doc, fonts);
  state.data = printData;

  addHeader(state, printData, true);

  // Info block (not split)
  const infoText = `${printData.project.name || "Projekt"} · Besprechung #${printData.meeting.index || ""} · Top-Liste`;
  ensureSpace(state, printData, 28);
  state.page.drawText(infoText, { x: MARGINS.left, y: state.y, size: 13, font: fonts.body });
  state.y -= 18;
  const dateLine = `Datum: ${(printData.meeting.created_at || "").slice(0, 10)}`;
  state.page.drawText(dateLine, { x: MARGINS.left, y: state.y, size: FONTS.meta, font: fonts.meta });
  state.y -= 14;

  renderTree(state, printData, printData.tops || []);

  addFooter(state);
  return doc.save();
}
