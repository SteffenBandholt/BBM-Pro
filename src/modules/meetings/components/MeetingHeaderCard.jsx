import MeetingTopStatusBadge from './MeetingTopStatusBadge.jsx';

export default function MeetingHeaderCard({ meeting, onAbort, onSave, onOpenProtocol }) {
  return (
    <article className="meeting-header-card">
      <div className="meeting-header-card__eyebrow">Besprechung in Arbeit</div>
      <div className="meeting-header-card__title-row">
        <div>
          <h1>{meeting.projectName}</h1>
          <p className="meeting-header-card__subtitle">
            {meeting.title} · {meeting.number}
          </p>
        </div>
        <MeetingTopStatusBadge status={meeting.status} />
      </div>
      <div className="meeting-header-card__meta">
        <span>{meeting.date}</span>
        <span>{meeting.time}</span>
        <span>{meeting.participantCount} Teilnehmer</span>
      </div>
      <div className="meeting-header-card__actions">
        <button type="button" className="button button--secondary" onClick={onAbort}>
          Abbrechen
        </button>
        <button type="button" className="button" onClick={onSave}>
          Zwischenspeichern
        </button>
        <button type="button" className="button button--secondary" onClick={onOpenProtocol}>
          Protokoll öffnen
        </button>
      </div>
    </article>
  );
}
