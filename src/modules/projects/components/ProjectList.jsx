import ProjectCard from './ProjectCard.jsx';

export default function ProjectList({ projects, onProjectClick }) {
  return (
    <ul className="project-list">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} onClick={() => onProjectClick(project)} />
        </li>
      ))}
    </ul>
  );
}
