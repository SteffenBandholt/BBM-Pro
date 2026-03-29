import { Link } from 'react-router-dom';

export default function RecentProjectsPanel({ projects }) {
  return (
    <section className="dashboard-section">
      <div className="page-header">
        <h2>Projekt-Schnellzugriff</h2>
        <Link className="button button--secondary" to="/projects">
          Alle Projekte anzeigen
        </Link>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <Link key={project.id} className="project-card" to={`/projects/${project.id}`}>
            <span className="project-card__name">{project.name || 'Projekt'}</span>
            <span className="project-card__meta">
              {project.number || '-'} · {project.city || '-'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
