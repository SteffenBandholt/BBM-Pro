export default function MeetingListItem({ meeting, onClick }) {
  return (
    <button type="button" className="project-card meeting-card" onClick={onClick}>
      <span className="project-card__eyebrow">Besprechung öffnen</span>
      <span className="project-card__name">
        {meeting.number ? `TOP ${meeting.number}` : `Nr. ${meeting.id}`} · {meeting.title}
      </span>
      <span className="project-card__meta">{meeting.date}</span>
      <span className="project-card__meta">{meeting.status || 'Status offen'}</span>
      <span className="project-card__meta">{meeting.keyword || 'Kein Schlagwort'}</span>
    </button>
  );
}
