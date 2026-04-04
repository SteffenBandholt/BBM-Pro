import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MeetingsList from '../components/MeetingsList.jsx';
import { useMeetings } from '../hooks/useMeetings.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProjectMeetingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { meetings, loading, error, createMeeting, updateMeetingKeyword } = useMeetings(projectId);
  const [isCreating, setIsCreating] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState(todayIso());

  const handleCreate = async () => {
    if (!date.trim()) return;

    const newMeeting = await createMeeting({
      keyword: keyword.trim(),
      date,
    });

    if (!newMeeting?.id) {
      return;
    }

    setKeyword('');
    setDate(todayIso());
    setIsCreating(false);
    navigate(`/meetings/${newMeeting.id}`);
  };

  const handleStartCreate = () => {
    setKeyword('');
    setDate(todayIso());
    setIsCreating(true);
  };

  return (
    <section className="page-section">
      <div className="meeting-list-hero">
        <div>
          <p className="meeting-list-hero__eyebrow">Besprechungen im Projekt</p>
          <h1>Besprechungen</h1>
          <p>Hier oeffnest du laufende Protokolle oder legst schnell eine neue Besprechung an.</p>
        </div>
        <button type="button" className="button meeting-list-hero__cta" onClick={handleStartCreate}>
          Neue Besprechung
        </button>
      </div>

      {isCreating ? (
        <section className="meeting-list-create">
          <label className="field">
            <span>Datum</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Schlagwort (optional)</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="button" onClick={handleCreate}>
              Anlegen
            </button>
            <button type="button" className="button button--secondary" onClick={() => setIsCreating(false)}>
              Abbrechen
            </button>
          </div>
        </section>
      ) : null}

      {loading ? <p>Lade Besprechungen ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error ? (
        <MeetingsList
          meetings={meetings}
          onMeetingClick={(meeting) => navigate(`/meetings/${meeting.id}`)}
          onMeetingKeywordSave={updateMeetingKeyword}
        />
      ) : null}
    </section>
  );
}
