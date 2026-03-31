export default function ProjectMeetingPreview({ meeting, onOpen }) {
  return (
    <button type="button" className="project-meeting-preview" onClick={onOpen}>
      <span className="project-meeting-preview__eyebrow">Letzte Besprechung</span>
      <span className="project-meeting-preview__title">{meeting?.title || 'Noch keine Besprechung angelegt'}</span>
      <span className="project-meeting-preview__meta">{meeting?.date || 'Datum offen'}</span>
      <span className="project-meeting-preview__meta">{meeting?.keyword || 'Kein Schlagwort'}</span>
    </button>
  );
}
