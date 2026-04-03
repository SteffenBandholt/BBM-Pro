import { Link } from 'react-router-dom';

export default function ActionLinksPanel({ title, description, actions }) {
  if (!actions?.length) {
    return null;
  }

  return (
    <section className="dashboard-section action-links-panel">
      <div>
        <h2>{title}</h2>
        {description ? <p className="action-links-panel__description">{description}</p> : null}
      </div>

      <div className="action-links-panel__list">
        {actions.map((action) => (
          <Link key={action.id} className="action-links-panel__item" to={action.href}>
            <span className="action-links-panel__title">{action.title}</span>
            <span className="action-links-panel__meta">{action.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
