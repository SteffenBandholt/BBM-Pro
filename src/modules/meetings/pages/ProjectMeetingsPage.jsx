import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MeetingsList from '../components/MeetingsList.jsx';
import { useMeetings } from '../hooks/useMeetings.js';

export default function ProjectMeetingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { meetings, loading, error, createMeeting } = useMeetings(projectId);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !date.trim()) return;

    const newMeeting = await createMeeting({
      title: title.trim(),
      date,
    });

    setTitle('');
    setDate('');
    setIsCreating(false);
    navigate(`/meetings/${newMeeting.id}`);
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Besprechungen</h1>
          <p>Projektbezogene Besprechungen</p>
        </div>
        <button type="button" className="button" onClick={() => setIsCreating(true)}>
          Neue Besprechung
        </button>
      </div>

      {isCreating ? (
        <section className="project-form">
          <label className="field">
            <span>Titel</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Datum</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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
        <MeetingsList meetings={meetings} onMeetingClick={(meeting) => navigate(`/meetings/${meeting.id}`)} />
      ) : null}
    </section>
  );
}
