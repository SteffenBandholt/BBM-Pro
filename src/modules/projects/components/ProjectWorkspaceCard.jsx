export default function ProjectWorkspaceCard({ title, description, active = false }) {
  return (
    <article
      className={active ? 'project-workspace-card project-workspace-card--active' : 'project-workspace-card'}
    >
      <span className="project-workspace-card__title">{title}</span>
      <span className="project-workspace-card__meta">{description}</span>
    </article>
  );
}
