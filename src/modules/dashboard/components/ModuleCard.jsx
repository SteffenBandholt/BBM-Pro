import { Link } from 'react-router-dom';

export default function ModuleCard({ module }) {
  const content = (
    <>
      <span className="project-card__name">{module.title}</span>
      <span className="project-card__meta">{module.description}</span>
    </>
  );

  if (!module.active || !module.href) {
    return <article className="project-card project-card--static">{content}</article>;
  }

  return (
    <Link className="project-card project-card--link" to={module.href}>
      {content}
    </Link>
  );
}
