const fakeDefects = [
  { id: 1, title: 'Riss in Wand', status: 'offen', priority: 'hoch' },
  { id: 2, title: 'Fehlende Beschilderung', status: 'in_bearbeitung', priority: 'mittel' },
  { id: 3, title: 'Tür schließt nicht sauber', status: 'erledigt', priority: 'niedrig' },
];

export async function listDefects() {
  return fakeDefects;
}
