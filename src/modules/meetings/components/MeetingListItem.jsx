import { useEffect, useState } from 'react';

export default function MeetingListItem({ meeting, onClick, onKeywordSave }) {
  const [keywordDraft, setKeywordDraft] = useState(meeting.keyword || meeting.title || '');

  useEffect(() => {
    setKeywordDraft(meeting.keyword || meeting.title || '');
  }, [meeting.keyword, meeting.title]);

  const handleKeywordBlur = async () => {
    const nextKeyword = keywordDraft.trim();
    const currentKeyword = (meeting.keyword || meeting.title || '').trim();
    if (nextKeyword === currentKeyword) return;
    try {
      await onKeywordSave?.(meeting.id, nextKeyword);
    } catch {
      setKeywordDraft(currentKeyword);
    }
  };

  return (
    <article className="project-card meeting-card meeting-card--static">
      <button type="button" className="meeting-card__open" onClick={onClick}>
        <span className="project-card__eyebrow">Besprechung oeffnen</span>
        <span className="project-card__name">
          {meeting.number ? `Protokoll #${meeting.number}` : 'Protokoll'}
        </span>
        <span className="project-card__meta">{meeting.date}</span>
        <span className="project-card__meta">{meeting.status || 'Status offen'}</span>
      </button>

      <label className="field meeting-card__keyword" onClick={(event) => event.stopPropagation()}>
        <span>Schlagwort</span>
        <input
          value={keywordDraft}
          onChange={(event) => setKeywordDraft(event.target.value)}
          onBlur={handleKeywordBlur}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
        />
      </label>
    </article>
  );
}
