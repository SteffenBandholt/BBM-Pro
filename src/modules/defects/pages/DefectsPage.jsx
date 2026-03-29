import DefectsList from '../components/DefectsList.jsx';
import { useDefects } from '../hooks/useDefects.js';

export default function DefectsPage() {
  const { defects, loading, error } = useDefects();

  return (
    <section className="page-section">
      <h1>Mängelmanagement</h1>
      <p>Bereich für die spätere Verwaltung projektbezogener Mängel.</p>
      <p>In Vorbereitung</p>

      {loading ? <p>Lade Mängel ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error ? <DefectsList defects={defects} /> : null}
    </section>
  );
}
