import FirmsList from '../components/FirmsList.jsx';
import FirmDetailPanel from '../components/FirmDetailPanel.jsx';
import { useFirms } from '../hooks/useFirms.js';

export default function FirmsPage() {
  const { firms, selectedFirm, setSelectedFirm, loading, error } = useFirms();

  return (
    <section className="project-participants">
      <h1>Firmen</h1>
      <p>Globale Firmen und ihre Mitarbeiter</p>

      {loading ? <p>Lade Firmen ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="project-participants__layout">
          <section className="project-participants__panel">
            <h2>Firmen</h2>
            <FirmsList firms={firms} selectedFirm={selectedFirm} setSelectedFirm={setSelectedFirm} />
          </section>

          <section className="project-participants__panel">
            <h2>Details</h2>
            {!selectedFirm ? (
              <p>Bitte wählen Sie links eine Firma aus.</p>
            ) : (
              <FirmDetailPanel firm={selectedFirm} />
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
