import { useState } from 'react';
import FirmsList from '../components/FirmsList.jsx';
import FirmDetailPanel from '../components/FirmDetailPanel.jsx';
import { useFirms } from '../hooks/useFirms.js';

export default function FirmsPage() {
  const { firms, selectedFirm, setSelectedFirm, loading, error, createGlobalFirm, createEmployeeForFirm } = useFirms();
  const [newFirmName, setNewFirmName] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');

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
                        });
                        if (createdEmployee) {
                          setNewEmployeeName('');
                        }
                      }}
                    >
                      Mitarbeiter anlegen
                    </button>
                  </div>
                </section>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
