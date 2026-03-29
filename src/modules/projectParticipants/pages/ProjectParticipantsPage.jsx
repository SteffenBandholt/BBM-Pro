export default function ProjectParticipantsPage() {
  return (
    <section className="project-participants">
      <h1>Projektbeteiligte</h1>

      <div className="project-participants__actions">
        <button type="button" className="button">
          Firma zuordnen
        </button>
        <button type="button" className="button button--secondary">
          Firma mit Mitarbeitern anlegen
        </button>
      </div>

      <div className="project-participants__layout">
        <section className="project-participants__panel">
          <h2>Firmen im Projekt</h2>
          <p>Keine Firmen vorhanden</p>
        </section>

        <section className="project-participants__panel">
          <h2>Details</h2>
          <p>Keine Firma ausgewählt</p>
        </section>
      </div>
    </section>
  );
}
