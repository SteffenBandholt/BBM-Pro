export default function ProjectSummaryCard({ project }) {
  return (
    <section className="project-summary-card">
      <div>
        <span className="project-summary-card__label">Projekt</span>
        <h2>{project.name || 'Projekt'}</h2>
      </div>
      <dl className="project-summary-card__details">
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
