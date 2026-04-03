export default function LastProjectPanel({
  project,
  onOpenProject,
  onGoToProjects,
  onCreateProject,
}) {
  return (
    <section className="dashboard-section last-project-panel">
      <div className="last-project-panel__intro">
        <div>
          <p className="last-project-panel__eyebrow">Weiterarbeiten</p>
          <h2>Letztes Projekt oeffnen</h2>
          <p className="last-project-panel__description">
            Der haeufigste Einstieg bleibt das Projekt, in dem du zuletzt gearbeitet hast.
          </p>
        </div>
        <button type="button" className="button button--secondary" onClick={onGoToProjects}>
          Projektuebersicht
        </button>
      </div>

      {project ? (
        <button
          type="button"
          className="last-project-panel__card"
          onClick={() => onOpenProject(project)}
        >
          <span className="last-project-panel__label">
            {project.isRemembered ? 'Zuletzt geoeffnet' : 'Empfohlener Einstieg'}
          </span>
          <span className="last-project-panel__title">{project.name}</span>
          <span className="last-project-panel__meta">{project.metaLine}</span>
          <span className="last-project-panel__details">
            <span>Letzte Aktivitaet: {project.lastActivityLabel || 'noch offen'}</span>
            <span>{project.latestMeetingLabel}</span>
          </span>
        </button>
      ) : (
        <div className="last-project-panel__empty">
          <p>Noch kein Projekt vorhanden. Lege zuerst ein Projekt an.</p>
          <button type="button" className="button" onClick={onCreateProject}>
            Neues Projekt anlegen
          </button>
        </div>
      )}
    </section>
  );
}
