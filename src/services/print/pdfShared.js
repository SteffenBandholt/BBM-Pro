import { StandardFonts } from "pdf-lib";

export const MM = 72 / 25.4;
export const PAGE = { width: 210 * MM, height: 297 * MM };
export const MARGINS = { left: 18 * MM, right: 18 * MM, top: 16 * MM, bottom: 16 * MM };
export const HEAD_HEIGHT = 24 * MM;
export const FOOT_HEIGHT = 16 * MM;

export function initState(doc, fonts) {
  const page = doc.addPage([PAGE.width, PAGE.height]);
  return { doc, fonts, page, y: PAGE.height - MARGINS.top - HEAD_HEIGHT, pageNumber: 1 };
}

export function addHeader(state, data, isFirst) {
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

export function addFooter(state) {
  const { page, fonts } = state;
  const y = MARGINS.bottom - 6 + FOOT_HEIGHT;
  const left = `Druck: ${new Date().toISOString().slice(0, 10)}`;
  page.drawText(left, { x: MARGINS.left, y, size: 9.5, font: fonts.meta });
  const right = `Seite ${state.pageNumber}`;
  const width = fonts.meta.widthOfTextAtSize(right, 9.5);
  page.drawText(right, { x: PAGE.width - MARGINS.right - width, y, size: 9.5, font: fonts.meta });
}

export function availableSpace(state) {
  return state.y - (MARGINS.bottom + FOOT_HEIGHT);
}

export function ensureSpace(state, data, needed) {
  if (availableSpace(state) < needed) {
    addFooter(state);
    const page = state.doc.addPage([PAGE.width, PAGE.height]);
    state.page = page;
    state.pageNumber += 1;
    state.y = PAGE.height - MARGINS.top - HEAD_HEIGHT;
    addHeader(state, data, false);
  }
}

export function wrapText(text, font, size, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export function drawLines(page, lines, { x, y, size, font, lineGap = 2, color }) {
  let cy = y;
  lines.forEach((ln) => {
    page.drawText(ln, { x, y: cy, size, font, color });
    cy -= size + lineGap;
  });
  return cy;
}

export async function loadDefaultFonts(doc) {
  const body = await doc.embedFont(StandardFonts.Helvetica);
  const meta = await doc.embedFont(StandardFonts.Helvetica);
  return { body, meta };
}
