import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Layout constants (pt)
const MM = 72 / 25.4;
const PAGE = { width: 210 * MM, height: 297 * MM };
const MARGINS = { left: 18 * MM, right: 18 * MM, top: 16 * MM, bottom: 16 * MM };
const HEAD_HEIGHT = 24 * MM;
const FOOT_HEIGHT = 16 * MM;

const FONTS = {
  body: { size: 10.5 },
  meta: { size: 9.5 },
  title: { size: 13 },
  h1: { size: 16 },
};

function mm(value) {
  return value * MM;
}

function initState(doc, fonts) {
  const page = doc.addPage([PAGE.width, PAGE.height]);
  return {
    doc,
    fonts,
    page,
    y: PAGE.height - MARGINS.top - HEAD_HEIGHT,
    pageNumber: 1,
  };
}

function addHeader(state, data, isFirst) {
  const { page, fonts } = state;
  const yTop = PAGE.height - MARGINS.top;
  const text = isFirst
    ? `${data.project.name} · Besprechung #${data.meeting.index} · ${data.mode}`
    : `${data.mode} · ${data.project.name} · #${data.meeting.index}`;
  page.drawText(text, {
    x: MARGINS.left,
    y: yTop - 12,
    size: 11,
    font: fonts.body,
  });
  if (!isFirst) {
    const pageLabel = `Seite ${state.pageNumber}`;
    const width = fonts.body.widthOfTextAtSize(pageLabel, 11);
    page.drawText(pageLabel, {
      x: PAGE.width - MARGINS.right - width,
      y: yTop - 12,
      size: 11,
      font: fonts.body,
    });
  }
}

function addFooter(state) {
  const { page, fonts } = state;
  const y = MARGINS.bottom - 6 + FOOT_HEIGHT;
  const left = `Druck: ${new Date().toISOString().slice(0, 10)}`;
  page.drawText(left, { x: MARGINS.left, y, size: 9.5, font: fonts.meta });
  const right = `Seite ${state.pageNumber}`;
  const width = fonts.meta.widthOfTextAtSize(right, 9.5);
  page.drawText(right, { x: PAGE.width - MARGINS.right - width, y, size: 9.5, font: fonts.meta });
}

function newPage(state, data, isFirst = false) {
  addFooter(state);
  const page = state.doc.addPage([PAGE.width, PAGE.height]);
  state.page = page;
  state.pageNumber += 1;
  state.y = PAGE.height - MARGINS.top - HEAD_HEIGHT;
  addHeader(state, data, isFirst);
}

function ensureSpace(state, data, needed) {
  const available = state.y - MARGINS.bottom - FOOT_HEIGHT;
  if (available < needed) {
    newPage(state, data, false);
  }
}

function drawTextBlock(page, text, x, y, size, font, maxWidth) {
  const words = String(text || "").split(/\s+/);
  let line = "";
  let cursorY = y;
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font });
      cursorY -= size + 2;
      line = w;
    } else {
      line = test;
    }
  });
  if (line) {
    page.drawText(line, { x, y: cursorY, size, font });
    cursorY -= size + 2;
  }
  return cursorY;
}

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
  data.participants.forEach((p) => {
    ensureSpace(state, data, 12);
    const flags = [
      p.isPresent ? "anwesend" : null,
      p.isInDistribution ? "Verteiler" : null,
    ].filter(Boolean).join(", ");
    page.drawText(`${p.firmName || ""}${flags ? " · " + flags : ""}`, {
      x: MARGINS.left,
      y: state.y,
      size: FONTS.meta.size,
      font: fonts.meta,
    });
    state.y -= 12;
  });
  state.y -= 6;
}

function renderTop(state, data, top) {
  const { page, fonts } = state;
  const minHeight = 3 * (FONTS.body.size + 2); // title + meta + one line
  ensureSpace(state, data, minHeight);

  const indent = (top.level - 1) * 10;
  const x = MARGINS.left + indent;

  // title
  page.drawText(`${top.displayNumber || ""} ${top.title}`, {
    x,
    y: state.y,
    size: top.level === 1 ? FONTS.title.size : FONTS.body.size + 1,
    font: fonts.body,
    color: top.isCarriedOver && top.status === "erledigt" ? rgb(0.4, 0.4, 0.4) : rgb(0, 0, 0),
  });
  state.y -= FONTS.body.size + 4;

  // meta line
  const metaParts = [];
  if (top.status) metaParts.push(`Status: ${top.status}`);
  if (top.dueDate) metaParts.push(`Fällig: ${top.dueDate}`);
  if (top.responsibleLabel) metaParts.push(`Verantw.: ${top.responsibleLabel}`);
  if (top.ampelColor) metaParts.push(`Ampel: ${top.ampelColor}`);
  page.drawText(metaParts.join(" · "), { x, y: state.y, size: FONTS.meta.size, font: fonts.meta });
  state.y -= FONTS.meta.size + 2;

  // longtext
  const maxWidth = PAGE.width - MARGINS.right - x;
  state.y = drawTextBlock(page, top.longtext, x, state.y, FONTS.body.size, fonts.body, maxWidth);
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
