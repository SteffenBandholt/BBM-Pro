export default function MeetingSidebar({
  onCreateTop,
  participants,
  meetingData,
  protocolViewLabel,
}) {
  return (
    <aside className="meeting-sidebar">
      <button type="button" className="button meeting-sidebar__primary" onClick={onCreateTop}>
        + Neuer TOP
      </button>

      <section className="meeting-sidebar__panel">
        <h2>Kontext</h2>
        <button type="button" className="meeting-sidebar__link">
          Teilnehmer
        </button>
        <button type="button" className="meeting-sidebar__link">
          Protokollansicht
        </button>
        <button type="button" className="meeting-sidebar__link">
          Besprechungsdaten
        </button>
      </section>

      <section className="meeting-sidebar__panel">
        <h2>Schnellüberblick</h2>
        <dl className="meeting-sidebar__stats">
          <div>
            <dt>Offene Punkte</dt>
            <dd>{meetingData.openItems}</dd>
          </div>
          <div>
            <dt>Kritische Fristen</dt>
            <dd>{meetingData.criticalDeadlines}</dd>
          </div>
          <div>
            <dt>Teilnehmer</dt>
            <dd>{participants.length}</dd>
          </div>
        </dl>
      </section>

      <section className="meeting-sidebar__panel">
        <h2>Besprechungsdaten</h2>
        <p>{meetingData.date}</p>
        <p>{meetingData.time}</p>
        <p>{protocolViewLabel}</p>
      </section>
    </aside>
  );
}
