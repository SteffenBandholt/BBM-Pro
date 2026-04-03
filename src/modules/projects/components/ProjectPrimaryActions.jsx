export default function ProjectPrimaryActions({ actions }) {
  return (
    <section className="project-home-primary">
      <div className="project-home-primary__header">
        <h2>Was moechtest du in diesem Projekt tun?</h2>
        <p>Die haeufigsten Arbeitswege bleiben mit einem Klick erreichbar.</p>
      </div>

      <div className="project-home-action-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="project-home-action-card"
            onClick={action.onClick}
          >
            <span className="project-home-action-card__title">{action.title}</span>
            <span className="project-home-action-card__description">{action.description}</span>
            {action.note ? (
              <span className="project-home-action-card__note">{action.note}</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
