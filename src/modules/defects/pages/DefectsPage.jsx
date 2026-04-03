import { Link, useSearchParams } from 'react-router-dom';
import DefectsList from '../components/DefectsList.jsx';
import { useDefects } from '../hooks/useDefects.js';
import { useProjects } from '../../projects/hooks/useProjects.js';

export default function DefectsPage() {
  const { defects, loading, error } = useDefects();
  const { projects } = useProjects();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const project = projects.find((item) => String(item.id) === String(projectId));

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Maengelmanagement</h1>
          <p>
            {project
              ? `Projektkontext: ${project.name}${project.number ? ` - Nr. ${project.number}` : ''}`
              : 'Bereich fuer die aktuelle Verwaltung projektbezogener Maengel.'}
          </p>
        </div>
        {projectId ? (
          <Link className="button button--secondary" to={`/projects/${projectId}`}>
            Zurueck zum Projekt
          </Link>
        ) : null}
      </div>

      {loading ? <p>Lade Maengel ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error ? <DefectsList defects={defects} /> : null}
    </section>
  );
}
