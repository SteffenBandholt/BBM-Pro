export default function LastProjectPanel({
  project,
  onOpenProject,
  onCreateProject,
}) {
  return (
    <section className="dashboard-section last-project-panel">
      <h2>Weiterarbeiten</h2>

      {project ? (
        <button
          type="button"
          className="last-project-panel__card"
          onClick={() => onOpenProject(project)}
        >
          <span className="last-project-panel__label">
            {project.isRemembered ? 'Zuletzt geoeffnet' : 'Weiter im Projekt'}
          </span>
          <span className="last-project-panel__title">{project.name}</span>
          {project.metaLine ? (
            <span className="last-project-panel__meta">{project.metaLine}</span>
          ) : null}
          {project.lastActivityLabel || project.latestMeetingLabel ? (
            <span className="last-project-panel__details">
              {project.lastActivityLabel
                ? `Letzte Aktivitaet: ${project.lastActivityLabel}`
                : project.latestMeetingLabel}
            </span>
          ) : null}
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
