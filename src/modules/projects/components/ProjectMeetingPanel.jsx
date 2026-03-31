export default function ProjectMeetingPanel({ project, latestMeeting, onOpenMeetings, onNewMeeting, onOpenLatestMeeting }) {
  return (
    <section className="project-meeting-panel">
      <div className="project-meeting-panel__header">
        <div>
          <span className="project-meeting-panel__label">Besprechungen</span>
          <h2>Direkt zur nächsten Protokollrunde</h2>
        </div>
        <div className="project-meeting-panel__actions">
          <button type="button" className="button" onClick={onNewMeeting}>
            Neue Besprechung
          </button>
          <button type="button" className="button button--secondary" onClick={onOpenMeetings}>
            Besprechungen öffnen
          </button>
        </div>
      </div>

      <div className="project-meeting-panel__content">
        <div className="project-meeting-panel__summary">
          <p>{project.description || 'Hier starten Besprechung, Protokoll und Folgepunkte.'}</p>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{project.status || '-'}</dd>
            </div>
            <div>
              <dt>Ort</dt>
              <dd>{project.city || '-'}</dd>
            </div>
          </dl>
        </div>
        <div className="project-meeting-panel__latest">
          <span className="project-meeting-panel__latest-label">Zuletzt relevant</span>
          <button type="button" className="project-meeting-panel__latest-card" onClick={onOpenLatestMeeting}>
            <span className="project-meeting-panel__latest-title">{latestMeeting?.title || 'Noch keine Besprechung'}</span>
            <span className="project-meeting-panel__latest-meta">
              {latestMeeting?.date || 'Datum offen'} · {latestMeeting?.keyword || 'Kein Schlagwort'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
