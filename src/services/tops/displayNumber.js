/**
 * Compute display numbers for TOP hierarchy (level/number/parent).
 * Respects optional frozen_* fields when useFrozen = true.
 *
 * @param {Array} rows - items with id, level, number, parent_top_id, and optional frozen_* fields
 * @param {Object} opts
 * @param {boolean} opts.useFrozen
 * @returns {Map<string,string>} id -> displayNumber
 */
export function computeDisplayNumbers(rows, { useFrozen = false } = {}) {
  const byId = new Map();
  rows.forEach((r) => {
    const level = useFrozen ? r.frozen_level ?? r.level : r.level;
    const number = useFrozen ? r.frozen_number ?? r.number : r.number;
    const parent = useFrozen
      ? (r.frozen_parent_top_id !== undefined && r.frozen_parent_top_id !== null
          ? r.frozen_parent_top_id
          : r.parent_top_id ?? null)
      : r.parent_top_id ?? null;
    byId.set(String(r.id), { id: r.id, parent, level: Number(level), number: Number(number) });
  });

  const display = new Map();

  function assign(id, stack = new Set()) {
    const key = String(id);
    if (display.has(key)) return display.get(key);
    if (stack.has(key)) return ""; // cycle guard
    const node = byId.get(key);
    if (!node) return "";
    stack.add(key);
    const own = Number.isFinite(node.number) ? String(node.number) : "";
    if (!node.parent) {
      display.set(key, own);
      stack.delete(key);
      return own;
    }
    const parentDisp = assign(node.parent, stack);
    const val = parentDisp ? `${parentDisp}.${own}` : own;
    display.set(key, val);
    stack.delete(key);
    return val;
  }

  Array.from(byId.keys()).forEach((id) => assign(id));
  return display;
}
