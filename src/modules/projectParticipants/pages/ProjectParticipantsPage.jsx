import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectParticipants } from '../hooks/useProjectParticipants.js';
import { listFirms } from '../../firms/services/firmsService.js';

export default function ProjectParticipantsPage() {
  const { projectId } = useParams();
  const {
    firms,
    selectedFirm,
    setSelectedFirm,
    loading,
    error,
    createProjectFirm,
    assignGlobalFirm,
    removeFirmFromProject,
    activateEmployeeForProject,
    deactivateEmployeeForProject,
    createProjectLocalEmployeeForFirm,
    updateProjectLocalEmployeeForFirm,
  } = useProjectParticipants(projectId);
  const [mode, setMode] = useState(null);
  const [newFirmName, setNewFirmName] = useState('');
  const [newProjectLocalEmployeeName, setNewProjectLocalEmployeeName] = useState('');
  const [editingProjectLocalEmployeeId, setEditingProjectLocalEmployeeId] = useState(null);
  const [editingProjectLocalEmployeeName, setEditingProjectLocalEmployeeName] = useState('');
  const [globalFirms, setGlobalFirms] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadGlobalFirms = async () => {
      try {
        const items = await listFirms();
        if (isActive) {
          setGlobalFirms(items);
        }
      } catch (err) {
        console.error('[project-participants] global firms load failed', err);
      }
    };

    void loadGlobalFirms();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setEditingProjectLocalEmployeeId(null);
    setEditingProjectLocalEmployeeName('');
  }, [selectedFirm?.id]);

  return (
    <section className="project-participants">
      <h1>Firmen im Projekt</h1>

      <div className="project-participants__actions">
        <button type="button" className="button" onClick={() => setMode('assign')}>
          Firma zuordnen
        </button>
        <button type="button" className="button button--secondary" onClick={() => setMode('create')}>
          Projektfirma anlegen
        </button>
      </div>

      {mode === 'assign' ? (
        <section className="project-participants__panel">
          <h2>Globale Firma auswaehlen</h2>
          {globalFirms.length === 0 ? (
            <p>Es sind noch keine globalen Firmen vorhanden.</p>
          ) : (
            <ul className="project-participants__list">
              {globalFirms.map((firm) => (
                <li key={firm.id}>
                  <button
                    type="button"
                    className="project-participants__firm-button"
                    onClick={async () => {
                      const assigned = await assignGlobalFirm(firm);
                      if (assigned) {
                        setMode(null);
                      }
                    }}
                  >
                    <span className="project-participants__firm-name">{firm.name}</span>
                    <span className="project-participants__firm-meta">
                      {firm.employees?.length ? `${firm.employees.length} Firmenmitarbeiter` : 'Noch keine Firmenmitarbeiter'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="button button--secondary" onClick={() => setMode(null)}>
            Schliessen
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
              onChange={(event) => setNewFirmName(event.target.value)}
              placeholder="Name der Firma"
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={async () => {
                const trimmedName = newFirmName.trim();
                if (!trimmedName) return;
                const created = await createProjectFirm(trimmedName);
                if (created) {
                  setNewFirmName('');
                  setMode(null);
                }
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

      {loading ? <p>Lade Firmen ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="project-participants__layout">
          <section className="project-participants__panel">
            <h2>Firmen im Projekt</h2>
            {firms.length === 0 ? (
              <p>Noch keine Firmen im Projekt.</p>
            ) : (
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
                        {firm.projectEmployeeCount || 0} Projektmitarbeiter
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="project-participants__panel">
            <h2>Details</h2>
            {!selectedFirm ? (
              <p>Bitte waehlen Sie links eine Firma aus.</p>
            ) : (
              <>
                <div className="project-participants__card">
                  <p className="project-participants__label">Visitenkarte</p>
                  <p className="project-participants__card-title">{selectedFirm.name}</p>
                  <span className="project-participants__badge">
                    {selectedFirm.type === 'global' ? 'Aus Stammdaten' : 'Projektfirma'}
                  </span>
                </div>

                <div className="project-participants__actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={async () => {
                      await removeFirmFromProject(selectedFirm.id);
                    }}
                  >
                    Aus Projekt entfernen
                  </button>
                </div>

                <div>
                  <p className="project-participants__label">Projektinterne Mitarbeiter</p>
                  {selectedFirm.projectLocalEmployees?.length ? (
                    <ul className="project-participants__employees">
                      {selectedFirm.projectLocalEmployees.map((employee) => (
                        <li key={employee.id}>
                          <article className="project-participants__employee-card">
                            {editingProjectLocalEmployeeId === employee.id ? (
                              <>
                                <label className="field">
                                  <span>Name</span>
                                  <input
                                    value={editingProjectLocalEmployeeName}
                                    onChange={(event) => setEditingProjectLocalEmployeeName(event.target.value)}
                                    placeholder="Name des projektinternen Mitarbeiters"
                                  />
                                </label>
                                <div className="form-actions">
                                  <button
                                    type="button"
                                    className="button"
                                    onClick={async () => {
                                      const trimmedName = editingProjectLocalEmployeeName.trim();
                                      if (!trimmedName) return;
                                      const updated = await updateProjectLocalEmployeeForFirm({
                                        projectFirmId: selectedFirm.id,
                                        employeeId: employee.id,
                                        name: trimmedName,
                                      });
                                      if (updated) {
                                        setEditingProjectLocalEmployeeId(null);
                                        setEditingProjectLocalEmployeeName('');
                                      }
                                    }}
                                  >
                                    Speichern
                                  </button>
                                  <button
                                    type="button"
                                    className="button button--secondary"
                                    onClick={() => {
                                      setEditingProjectLocalEmployeeId(null);
                                      setEditingProjectLocalEmployeeName('');
                                    }}
                                  >
                                    Abbrechen
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="project-participants__employee-name">{employee.name}</p>
                                <p className="project-participants__employee-role">Nur in diesem Projekt</p>
                                <div className="form-actions">
                                  <button
                                    type="button"
                                    className="button button--secondary"
                                    onClick={() => {
                                      setEditingProjectLocalEmployeeId(employee.id);
                                      setEditingProjectLocalEmployeeName(employee.name || '');
                                    }}
                                  >
                                    Bearbeiten
                                  </button>
                                </div>
                              </>
                            )}
                          </article>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Noch keine projektinternen Mitarbeiter angelegt.</p>
                  )}
                </div>

                <div>
                  <section className="project-participants__panel">
                    <h3>Projektinternen Mitarbeiter anlegen</h3>
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={newProjectLocalEmployeeName}
                        onChange={(event) => setNewProjectLocalEmployeeName(event.target.value)}
                        placeholder="Name des projektinternen Mitarbeiters"
                      />
                    </label>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="button"
                        onClick={async () => {
                          const trimmedName = newProjectLocalEmployeeName.trim();
                          if (!trimmedName) return;
                          const created = await createProjectLocalEmployeeForFirm({
                            projectFirmId: selectedFirm.id,
                            name: trimmedName,
                          });
                          if (created) {
                            setNewProjectLocalEmployeeName('');
                          }
                        }}
                      >
                        Mitarbeiter anlegen
                      </button>
                    </div>
                  </section>
                </div>

                <div>
                  <p className="project-participants__label">Globale Mitarbeiter im Projekt</p>
                  {selectedFirm.activeEmployees?.length ? (
                    <ul className="project-participants__employees">
                      {selectedFirm.activeEmployees.map((employee) => (
                        <li key={employee.id}>
                          <article className="project-participants__employee-card">
                            <p className="project-participants__employee-name">{employee.name}</p>
                            <p className="project-participants__employee-role">Aus globalem Firmenstamm</p>
                            <div className="form-actions">
                              <button
                                type="button"
                                className="button button--secondary"
                                onClick={async () => {
                                  await deactivateEmployeeForProject({
                                    projectFirmId: selectedFirm.id,
                                    globalEmployeeId: employee.id,
                                  });
                                }}
                              >
                                Deaktivieren
                              </button>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Noch keine globalen Mitarbeiter im Projekt aktiviert.</p>
                  )}
                </div>

                <div>
                  <p className="project-participants__label">Moegliche globale Firmenmitarbeiter</p>
                  {!selectedFirm.globalFirmId ? (
                    <p>Diese Projektfirma ist nicht mit einem globalen Firmenstamm verknuepft.</p>
                  ) : selectedFirm.employees?.length ? (
                    <ul className="project-participants__employees">
                      {selectedFirm.employees.map((employee) => (
                        <li key={employee.id}>
                          <article className="project-participants__employee-card">
                            <p className="project-participants__employee-name">{employee.name}</p>
                            <p className="project-participants__employee-role">Aus globalem Firmenstamm</p>
                            <div className="form-actions">
                              {employee.active ? (
                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={async () => {
                                    await deactivateEmployeeForProject({
                                      projectFirmId: selectedFirm.id,
                                      globalEmployeeId: employee.id,
                                    });
                                  }}
                                >
                                  Im Projekt aktiv
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="button"
                                  onClick={async () => {
                                    await activateEmployeeForProject({
                                      projectFirmId: selectedFirm.id,
                                      globalEmployeeId: employee.id,
                                    });
                                  }}
                                >
                                  Im Projekt aktivieren
                                </button>
                              )}
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Im globalen Firmenstamm sind noch keine Mitarbeiter hinterlegt.</p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
