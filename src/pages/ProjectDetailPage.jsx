import { useParams } from 'react-router-dom';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();

  const project = projects.find((item) => String(item.id) === String(projectId));

  if (loading) {
    return <p>Lade Projekte ...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!project) {
    return <p>Projekt nicht gefunden.</p>;
  }

  return (
    <section className="page-section">
      <h1>Projekt-Details</h1>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>{project.name || '-'}</dd>
        </div>
        <div>
          <dt>Nummer</dt>
          <dd>{project.number || '-'}</dd>
        </div>
        <div>
          <dt>Ort</dt>
          <dd>{project.city || '-'}</dd>
        </div>
      </dl>
    </section>
  );
}
