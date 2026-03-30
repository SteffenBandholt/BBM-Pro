import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const availableParticipants = [
    { id: 1, name: 'Max Müller', firmName: 'Bauunternehmen Müller' },
    { id: 2, name: 'Anna Becker', firmName: 'Bauunternehmen Müller' },
  ];
  const [participants, setParticipants] = useState([]);

  const addParticipant = (participant) => {
    setParticipants((currentParticipants) => {
      if (currentParticipants.some((current) => current.id === participant.id)) {
        return currentParticipants;
      }

      return [...currentParticipants, participant];
    });
  };

  const removeParticipant = (participantId) => {
    setParticipants((currentParticipants) =>
      currentParticipants.filter((participant) => participant.id !== participantId),
    );
  };

  return (
    <section className="page-section">
      <h1>Besprechung</h1>
      <p>Meeting-Titel: {meetingId}</p>
      <p>Datum: -</p>

      <section className="project-participants__panel">
        <h2>Teilnehmer</h2>

        <div>
          <p className="project-participants__label">Verfügbare Teilnehmer</p>
          <ul className="project-participants__employees">
            {availableParticipants.map((participant) => (
              <li key={participant.id}>
                <article className="project-participants__employee-card">
                  <p className="project-participants__employee-name">{participant.name}</p>
                  <p className="project-participants__employee-role">{participant.firmName}</p>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => addParticipant(participant)}
                  >
                    Hinzufügen
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="project-participants__label">Ausgewählte Teilnehmer</p>
          <ul className="project-participants__employees">
            {participants.map((participant) => (
              <li key={participant.id}>
                <article className="project-participants__employee-card">
                  <p className="project-participants__employee-name">{participant.name}</p>
                  <p className="project-participants__employee-role">{participant.firmName}</p>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => removeParticipant(participant.id)}
                  >
                    Entfernen
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
