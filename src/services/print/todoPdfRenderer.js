import { PDFDocument, StandardFonts } from "pdf-lib";
import { wrapText, drawLines, MM, PAGE, MARGINS, HEAD_HEIGHT, FOOT_HEIGHT, addHeader, addFooter, initState, availableSpace, ensureSpace } from "./pdfShared.js";

// Column widths in points (sum should fit page width minus margins)
const COLS = [
  { key: "displayNumber", label: "Pos", width: 40 },
  { key: "title", label: "Kurztext", width: 180 },
  { key: "status", label: "Status", width: 60 },
  { key: "dueDate", label: "Fällig", width: 60 },
  { key: "ampelColor", label: "Ampel", width: 50 },
  { key: "responsibleLabel", label: "Verantw.", width: 90 },
];

const FONTS = {
  body: { size: 10.5 },
  meta: { size: 9.5 },
  head: { size: 11 },
};

function renderTableHeader(state) {
  const { page, fonts } = state;
  let x = MARGINS.left;
  COLS.forEach((col) => {
    page.drawText(col.label, { x, y: state.y, size: FONTS.head.size, font: fonts.body });
    x += col.width;
  });
  state.y -= FONTS.head.size + 6;
}

function renderRow(state, row) {
  const { page, fonts } = state;
  const maxLines = [];
  let x = MARGINS.left;
  const lineGap = 2;
  let rowHeight = 0;

  const values = {
    displayNumber: row.displayNumber || "",
    title: row.title || "",
    status: row.status || "",
    dueDate: row.dueDate || "",
    ampelColor: row.ampelColor || "",
    responsibleLabel: row.responsibleLabel || "",
  };

  // measure wrapped lines per column
  COLS.forEach((col) => {
    const lines = wrapText(values[col.key], fonts.body, FONTS.body.size, col.width - 2);
    maxLines.push(lines.length);
    rowHeight = Math.max(rowHeight, lines.length * (FONTS.body.size + lineGap));
  });

  if (availableSpace(state) < rowHeight + 6) {
    addFooter(state);
    const page = state.doc.addPage([PAGE.width, PAGE.height]);
    state.page = page;
    state.pageNumber += 1;
    state.y = PAGE.height - MARGINS.top - HEAD_HEIGHT;
    addHeader(state, state.data, false);
    renderTableHeader(state);
  }

  x = MARGINS.left;
  COLS.forEach((col) => {
    const lines = wrapText(values[col.key], fonts.body, FONTS.body.size, col.width - 2);
    drawLines(page, lines, { x: x + 1, y: state.y, size: FONTS.body.size, font: fonts.body, lineGap });
    x += col.width;
  });

  state.y -= rowHeight + 4;
}

export async function renderTodoPdf(printData) {
  if (printData.mode !== "todo") {
    throw new Error("renderTodoPdf supports only todo mode");
  }

  const doc = await PDFDocument.create();
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const metaFont = await doc.embedFont(StandardFonts.Helvetica);
  const fonts = { body: bodyFont, meta: metaFont };

  const state = initState(doc, fonts);
  state.data = printData;
  addHeader(state, printData, true);

  // Simple info block (not split)
  const infoText = `${printData.project.name || "Projekt"} · Besprechung #${printData.meeting.index || ""}`;
  ensureSpace(state, printData, 24);
  state.page.drawText(infoText, { x: MARGINS.left, y: state.y, size: 13, font: fonts.body });
  state.y -= 18;
  const dateLine = `Datum: ${(printData.meeting.created_at || "").slice(0, 10)}`;
  state.page.drawText(dateLine, { x: MARGINS.left, y: state.y, size: FONTS.meta.size, font: fonts.meta });
  state.y -= 14;

  renderTableHeader(state);

  const rows = printData.tops || [];
  rows.forEach((row) => renderRow(state, row));

  addFooter(state);
  return doc.save();
}
