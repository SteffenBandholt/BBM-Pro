export default function ProjectCard({ project, onClick }) {
  return (
    <button type="button" className="project-card" onClick={onClick}>
      <span className="project-card__name">{project.name}</span>
      {(project.number || project.city) && (
        <span className="project-card__meta">
          {project.number ? <span>Nr. {project.number}</span> : null}
          {project.number && project.city ? <span> · </span> : null}
          {project.city ? <span>{project.city}</span> : null}
        </span>
      )}
    </button>
  );
}
