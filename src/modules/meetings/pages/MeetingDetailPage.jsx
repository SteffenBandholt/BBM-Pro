import { useParams } from 'react-router-dom';

export default function MeetingDetailPage() {
  const { meetingId } = useParams();

  return (
    <section className="page-section">
      <h1>Besprechung</h1>
      <p>Meeting-Titel: {meetingId}</p>
      <p>Datum: -</p>
    </section>
  );
}
