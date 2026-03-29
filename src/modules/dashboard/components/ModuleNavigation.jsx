import ModuleCard from './ModuleCard.jsx';

export default function ModuleNavigation({ modules }) {
  return (
    <section className="dashboard-section">
      <h2>Module</h2>
      <div className="dashboard-grid">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
