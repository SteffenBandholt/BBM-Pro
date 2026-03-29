const fakeFirms = [
  {
    id: 1,
    name: 'Bauunternehmen Müller',
    type: 'global',
    employees: [
      { id: 1, name: 'Max Müller', role: 'Bauleiter' },
      { id: 2, name: 'Anna Becker', role: 'Polier' },
    ],
  },
  {
    id: 2,
    name: 'Architekturbüro Schmidt',
    type: 'global',
    employees: [{ id: 3, name: 'Thomas Schmidt', role: 'Architekt' }],
  },
  {
    id: 3,
    name: 'Lehrerkollegium Schule',
    type: 'project',
    employees: [{ id: 4, name: 'Frau Meier', role: 'Lehrerin' }],
  },
];

export async function listProjectParticipants() {
  return fakeFirms;
}
