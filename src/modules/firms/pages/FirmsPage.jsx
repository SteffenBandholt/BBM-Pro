import { useEffect, useState } from 'react';
import FirmsList from '../components/FirmsList.jsx';
import FirmDetailPanel from '../components/FirmDetailPanel.jsx';
import { useFirms } from '../hooks/useFirms.js';

export default function FirmsPage() {
  const { firms, selectedFirm, setSelectedFirm, loading, error, createGlobalFirm, createEmployeeForFirm, updateEmployeeForFirm } = useFirms();
  const [newFirmName, setNewFirmName] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingEmployeeName, setEditingEmployeeName] = useState('');
  const [editingEmployeeEmail, setEditingEmployeeEmail] = useState('');

  useEffect(() => {
    setEditingEmployeeId(null);
    setEditingEmployeeName('');
    setEditingEmployeeEmail('');
  }, [selectedFirm?.id]);

  return (
    <section className="project-participants">
      <h1>Firmen</h1>

      <section className="project-participants__panel">
        <h2>Globale Firma anlegen</h2>
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
              const createdFirm = await createGlobalFirm({ name: trimmedName });
              if (createdFirm) {
                setNewFirmName('');
              }
            }}
          >
            Firma anlegen
          </button>
        </div>
      </section>

      {loading ? <p>Lade Firmen ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="project-participants__layout">
          <section className="project-participants__panel">
            <h2>Globale Firmen</h2>
            <FirmsList firms={firms} selectedFirm={selectedFirm} setSelectedFirm={setSelectedFirm} />
          </section>

          <section className="project-participants__panel">
            <h2>Details</h2>
            {!selectedFirm ? (
              <p>Bitte waehlen Sie links eine Firma aus.</p>
            ) : (
              <>
                <FirmDetailPanel firm={selectedFirm} />

                <section className="project-participants__panel">
                  <h3>Mitarbeiter anlegen</h3>
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={newEmployeeName}
                      onChange={(event) => setNewEmployeeName(event.target.value)}
                      placeholder="Name des Mitarbeiters"
                    />
                  </label>
                  <label className="field">
                    <span>E-Mail</span>
                    <input
                      value={newEmployeeEmail}
                      onChange={(event) => setNewEmployeeEmail(event.target.value)}
                      placeholder="E-Mail des Mitarbeiters"
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="button"
                      onClick={async () => {
                        const trimmedName = newEmployeeName.trim();
                        if (!trimmedName) return;
                        const createdEmployee = await createEmployeeForFirm({
                          firmId: selectedFirm.id,
                          name: trimmedName,
                          email: newEmployeeEmail.trim(),
                        });
                        if (createdEmployee) {
                          setNewEmployeeName('');
                          setNewEmployeeEmail('');
                        }
                      }}
                    >
                      Mitarbeiter anlegen
                    </button>
                  </div>
                </section>

                <section className="project-participants__panel">
                  <h3>Mitarbeiter bearbeiten</h3>
                  {selectedFirm.employees?.length ? (
                    <ul className="project-participants__employees">
                      {selectedFirm.employees.map((employee) => (
                        <li key={employee.id}>
                          <article className="project-participants__employee-card">
                            {editingEmployeeId === employee.id ? (
                              <>
                                <label className="field">
                                  <span>Name</span>
                                  <input
                                    value={editingEmployeeName}
                                    onChange={(event) => setEditingEmployeeName(event.target.value)}
                                    placeholder="Name des Mitarbeiters"
                                  />
                                </label>
                                <label className="field">
                                  <span>E-Mail</span>
                                  <input
                                    value={editingEmployeeEmail}
                                    onChange={(event) => setEditingEmployeeEmail(event.target.value)}
                                    placeholder="E-Mail des Mitarbeiters"
                                  />
                                </label>
                                <div className="form-actions">
                                  <button
                                    type="button"
                                    className="button"
                                    onClick={async () => {
                                      const trimmedName = editingEmployeeName.trim();
                                      if (!trimmedName) return;
                                      const updated = await updateEmployeeForFirm({
                                        firmId: selectedFirm.id,
                                        employeeId: employee.id,
                                        name: trimmedName,
                                        email: editingEmployeeEmail.trim(),
                                      });
                                      if (updated) {
                                        setEditingEmployeeId(null);
                                        setEditingEmployeeName('');
                                        setEditingEmployeeEmail('');
                                      }
                                    }}
                                  >
                                    Speichern
                                  </button>
                                  <button
                                    type="button"
                                    className="button button--secondary"
                                    onClick={() => {
                                      setEditingEmployeeId(null);
                                      setEditingEmployeeName('');
                                      setEditingEmployeeEmail('');
                                    }}
                                  >
                                    Abbrechen
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="project-participants__employee-name">{employee.name}</p>
                                <p className="project-participants__employee-role">{employee.email || 'Keine E-Mail gepflegt'}</p>
                                <div className="form-actions">
                                  <button
                                    type="button"
                                    className="button button--secondary"
                                    onClick={() => {
                                      setEditingEmployeeId(employee.id);
                                      setEditingEmployeeName(employee.name || '');
                                      setEditingEmployeeEmail(employee.email || '');
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
                    <p>Noch keine Mitarbeiter vorhanden.</p>
                  )}
                </section>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
