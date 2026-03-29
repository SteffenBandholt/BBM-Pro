import { useState } from 'react';
import { useProjectParticipants } from '../hooks/useProjectParticipants.js';

export default function ProjectParticipantsPage() {
  const { firms, selectedFirm, setSelectedFirm, loading, error } = useProjectParticipants();
  const [mode, setMode] = useState(null);

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
          <p>Auswahl wird hier später implementiert.</p>
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
            <input placeholder="Name der Firma" />
          </label>

          <div className="form-actions">
            <button type="button" className="button">
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
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
