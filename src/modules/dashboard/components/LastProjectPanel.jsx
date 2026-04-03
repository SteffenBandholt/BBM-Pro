export default function LastProjectPanel({
  project,
  onOpenProtocol,
  onCreateProject,
}) {
  return (
    <section className="dashboard-section last-project-panel">
      <h2>Schnellstart</h2>

      {project ? (
        <button
          type="button"
          className="last-project-panel__card"
          onClick={() => onOpenProtocol(project)}
        >
          <span className="last-project-panel__label">Zum Protokoll</span>
          <span className="last-project-panel__meta">{project.name}</span>
          <span className="last-project-panel__details">
            {project.latestMeetingLabel === 'Noch keine Besprechung'
              ? 'neues Protokoll wird angelegt'
              : 'vorhandenes Protokoll oeffnen'}
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
