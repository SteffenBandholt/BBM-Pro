export default function ProjectHomeHeader({
  project,
  latestMeetingLabel,
  lastActivityLabel,
}) {
  return (
    <section className="project-home-header">
      <p className="project-home-header__eyebrow">
        {project.number ? `Projekt ${project.number}` : 'Projekt'}
      </p>
      <h1>{project.name || 'Projekt'}</h1>
      <p className="project-home-header__subtitle">
        {project.city ? `${project.city} - ` : ''}
        {project.status || 'Status offen'}
      </p>

      <dl className="project-home-header__facts">
        {project.status ? (
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
        ) : null}

        {lastActivityLabel ? (
          <div>
            <dt>Letzte Aktivitaet</dt>
            <dd>{lastActivityLabel}</dd>
          </div>
        ) : null}

        <div>
          <dt>Letzte Besprechung</dt>
          <dd>{latestMeetingLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
