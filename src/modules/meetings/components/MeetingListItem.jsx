export default function MeetingListItem({ meeting, onClick }) {
  return (
    <button type="button" className="project-card" onClick={onClick}>
      <span className="project-card__name">{meeting.title}</span>
      <span className="project-card__meta">{meeting.date}</span>
    </button>
  );
}
