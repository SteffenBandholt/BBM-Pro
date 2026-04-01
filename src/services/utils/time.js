export function nowIso() {
  return new Date().toISOString();
}

export function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}
