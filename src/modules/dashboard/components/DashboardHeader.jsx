export default function DashboardHeader({ title, description, onNewProject, onGoToProjects }) {
  return (
    <section className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="form-actions">
        <button type="button" className="button" onClick={onNewProject}>
          Neues Projekt
        </button>
        <button type="button" className="button button--secondary" onClick={onGoToProjects}>
          Zu Projekten
        </button>
      </div>
    </section>
  );
}
