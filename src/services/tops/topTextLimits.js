export const TOP_TITLE_MAX_LENGTH = 100;
export const TOP_LONGTEXT_MAX_LENGTH = 500;

function toText(value) {
  if (value == null) return '';
  return String(value);
}

function assertMaxLength(label, value, maxLength) {
  if (toText(value).length > maxLength) {
    throw new Error(`${label} darf maximal ${maxLength} Zeichen haben.`);
  }
}

export function getTextLength(value) {
  return toText(value).length;
}

export function clampTopTitleInput(value) {
  return toText(value).slice(0, TOP_TITLE_MAX_LENGTH);
}

export function clampTopLongtextInput(value) {
  return toText(value).slice(0, TOP_LONGTEXT_MAX_LENGTH);
}

export function normalizeTopTitleForStorage(value) {
  const normalized = toText(value);
  assertMaxLength('Titel', normalized, TOP_TITLE_MAX_LENGTH);
  return normalized;
}

export function normalizeTopLongtextForStorage(value) {
  if (value == null) return null;

  const normalized = String(value);
  assertMaxLength('Langtext', normalized, TOP_LONGTEXT_MAX_LENGTH);
  return normalized;
}
