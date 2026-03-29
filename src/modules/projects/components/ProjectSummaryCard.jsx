export default function ProjectSummaryCard({ project }) {
  return (
    <section className="project-summary-card">
      <div>
        <span className="project-summary-card__label">Projekt</span>
        <h2>{project.name || 'Projekt'}</h2>
      </div>
      <dl className="project-summary-card__details">
        <div>
          <dt>Status</dt>
          <dd>{project.status || '-'}</dd>
        </div>
        <div>
          <dt>Nummer</dt>
          <dd>{project.number || '-'}</dd>
        </div>
        <div>
          <dt>Ort</dt>
          <dd>{project.city || '-'}</dd>
        </div>
        <div>
          <dt>Zeitraum</dt>
          <dd>
            {project.startDate || '-'} bis {project.endDate || '-'}
          </dd>
        </div>
      </dl>
      {project.description ? <p className="project-summary-card__description">{project.description}</p> : null}
    </section>
  );
}
