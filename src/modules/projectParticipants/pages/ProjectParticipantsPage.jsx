import { useState } from 'react';

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

export default function ProjectParticipantsPage() {
  const [selectedFirm, setSelectedFirm] = useState(null);

  return (
    <section className="project-participants">
      <h1>Projektbeteiligte</h1>

      <div className="project-participants__actions">
        <button type="button" className="button">
          Firma zuordnen
        </button>
        <button type="button" className="button button--secondary">
          Firma mit Mitarbeitern anlegen
        </button>
      </div>

      <div className="project-participants__layout">
        <section className="project-participants__panel">
          <h2>Firmen im Projekt</h2>
          <ul className="project-participants__list">
            {fakeFirms.map((firm) => (
              <li key={firm.id}>
                <button
                  type="button"
                  className={
                    selectedFirm?.id === firm.id
                      ? 'project-participants__firm-button project-participants__firm-button--active'
                      : 'project-participants__firm-button'
                  }
                  onClick={() => setSelectedFirm(firm)}
                >
                  {firm.name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="project-participants__panel">
          <h2>Details</h2>
          {!selectedFirm ? (
            <p>Keine Firma ausgewählt</p>
          ) : (
            <>
              <div className="project-participants__card">
                <p className="project-participants__label">Visitenkarte</p>
                <p>{selectedFirm.name}</p>
                <p>Typ: {selectedFirm.type === 'global' ? 'global' : 'projektfirma'}</p>
              </div>

              <div>
                <p className="project-participants__label">Mitarbeiter</p>
                <ul className="project-participants__employees">
                  {selectedFirm.employees.map((employee) => (
                    <li key={employee.id}>
                      {employee.name} - {employee.role}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
