import ProjectWorkspaceCard from './ProjectWorkspaceCard.jsx';

export default function ProjectWorkspaceGrid({ workspaces }) {
  return (
    <section className="project-workspace-section">
      <h2>Arbeitsbereiche</h2>
      <div className="project-workspace-grid">
        {workspaces.map((workspace) => (
          <ProjectWorkspaceCard
            key={workspace.id}
            title={workspace.title}
            description={workspace.description}
            active={workspace.active}
          />
        ))}
      </div>
    </section>
  );
}
