import { useState } from 'react';
import { useProjectParticipants } from '../hooks/useProjectParticipants.js';

const fakeGlobalFirms = [
  {
    id: 101,
    name: 'Elektro GmbH',
    type: 'global',
    employees: [{ id: 201, name: 'Peter Strom', role: 'Elektriker' }],
  },
  {
    id: 102,
    name: 'Sanitär AG',
    type: 'global',
    employees: [{ id: 202, name: 'Hans Wasser', role: 'Installateur' }],
  },
];

export default function ProjectParticipantsPage() {
  const {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createProjectFirm,
    addEmployeeToProjectFirm,
    assignGlobalFirm,
    removeFirmFromProject,
  } = useProjectParticipants();
  const [mode, setMode] = useState(null);
  const [newFirmName, setNewFirmName] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');

  return (
    <section className="project-participants">
      <h1>Projektbeteiligte</h1>

      <div className="project-participants__actions">
        <button type="button" className="button" onClick={() => setMode('assign')}>
          Firma zuordnen
        </button>
        <button type="button" className="button button--secondary" onClick={() => setMode('create')}>
          Firma mit Mitarbeitern anlegen
        </button>
      </div>

      {mode === 'assign' ? (
        <section className="project-participants__panel">
          <h2>Globale Firma auswählen</h2>
          <ul className="project-participants__list">
            {fakeGlobalFirms.map((firm) => (
              <li key={firm.id}>
                <button
                  type="button"
                  className="project-participants__firm-button"
                  onClick={() => {
                    assignGlobalFirm(firm);
                    setMode(null);
                  }}
                >
                  <span className="project-participants__firm-name">{firm.name}</span>
                  <span className="project-participants__firm-meta">
                    Global · {firm.employees.length} Mitarbeiter
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="button button--secondary" onClick={() => setMode(null)}>
            Schließen
          </button>
        </section>
      ) : null}

      {mode === 'create' ? (
        <section className="project-participants__panel">
          <h2>Projektfirma anlegen</h2>

          <label className="field">
            <span>Firmenname</span>
            <input
              value={newFirmName}
              onChange={(e) => setNewFirmName(e.target.value)}
              placeholder="Name der Firma"
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                if (!newFirmName.trim()) return;
                createProjectFirm(newFirmName.trim());
                setNewFirmName('');
                setMode(null);
              }}
            >
              Anlegen
            </button>
            <button type="button" className="button button--secondary" onClick={() => setMode(null)}>
              Abbrechen
            </button>
          </div>
        </section>
      ) : null}

      {loading ? <p>Lade Projektbeteiligte ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="project-participants__layout">
          <section className="project-participants__panel">
            <h2>Firmen im Projekt</h2>
            <ul className="project-participants__list">
              {firms.map((firm) => (
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
                    <span className="project-participants__firm-name">{firm.name}</span>
                    <span className="project-participants__firm-meta">
                      {firm.type === 'global' ? 'Global' : 'Projektfirma'} · {firm.employees.length} Mitarbeiter
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="project-participants__panel">
            <h2>Details</h2>
            {!selectedFirm ? (
              <p>Bitte wählen Sie links eine Firma aus.</p>
            ) : (
              <>
                <div className="project-participants__card">
                  <p className="project-participants__label">Visitenkarte</p>
                  <p className="project-participants__card-title">{selectedFirm.name}</p>
                  <span className="project-participants__badge">
                    {selectedFirm.type === 'global' ? 'Global' : 'Projektfirma'}
                  </span>
                  <p className="project-participants__card-placeholder">Adresse: -</p>
                  <p className="project-participants__card-placeholder">Kontakt: -</p>
                </div>

                <div className="project-participants__actions">
                  {selectedFirm.type === 'project' ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => removeFirmFromProject(selectedFirm.id)}
                    >
                      Projektfirma löschen
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => removeFirmFromProject(selectedFirm.id)}
                    >
                      Aus Projekt entfernen
                    </button>
                  )}
                </div>

                <div>
                  <p className="project-participants__label">Mitarbeiter im Projekt</p>
                  <ul className="project-participants__employees">
                    {selectedFirm.employees.map((employee) => (
                      <li key={employee.id}>
                        <article className="project-participants__employee-card">
                          <p className="project-participants__employee-name">{employee.name}</p>
                          <p className="project-participants__employee-role">{employee.role}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedFirm.type === 'project' ? (
                  <div className="project-participants__panel">
                    <h3>Mitarbeiter hinzufügen</h3>

                    <label className="field">
                      <span>Name</span>
                      <input
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Rolle</span>
                      <input
                        value={newEmployeeRole}
                        onChange={(e) => setNewEmployeeRole(e.target.value)}
                      />
                    </label>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          if (!newEmployeeName.trim()) return;

                          addEmployeeToProjectFirm(selectedFirm.id, {
                            name: newEmployeeName.trim(),
                            role: newEmployeeRole.trim(),
                          });

                          setNewEmployeeName('');
                          setNewEmployeeRole('');
                        }}
                      >
                        Mitarbeiter hinzufügen
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
