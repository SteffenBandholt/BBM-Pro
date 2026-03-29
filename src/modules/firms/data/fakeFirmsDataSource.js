const fakeFirms = [
  {
    id: 1,
    name: 'Elektro GmbH',
    employees: [
      { id: 11, name: 'Peter Strom', role: 'Elektriker' },
      { id: 12, name: 'Julia Kabel', role: 'Projektleiterin' },
    ],
  },
  {
    id: 2,
    name: 'Sanitär AG',
    employees: [{ id: 21, name: 'Hans Wasser', role: 'Installateur' }],
  },
];

export async function listFirms() {
  return fakeFirms;
}
