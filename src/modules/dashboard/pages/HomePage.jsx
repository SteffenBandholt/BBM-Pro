import { useNavigate } from 'react-router-dom';
import ActionLinksPanel from '../components/ActionLinksPanel.jsx';
import LastProjectPanel from '../components/LastProjectPanel.jsx';
import { useAppHome } from '../hooks/useAppHome.js';
import ProjectList from '../../projects/components/ProjectList.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { lastProject, activeProjects, projectManagement, masterData, loading, error } = useAppHome();

  const handleNewProject = () => {
    navigate('/projects?mode=create');
  };

  const handleGoToProjects = () => {
    navigate('/projects');
  };

  const handleOpenProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <section className="page-section app-home">
      <div className="app-home__hero">
        <h1>Weiterarbeiten</h1>
        <p>Oeffne dein letztes Projekt oder waehle direkt eines der aktiven Projekte.</p>
      </div>

      {loading ? <p>Lade Startseite ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <LastProjectPanel
            project={lastProject}
            onOpenProject={handleOpenProject}
            onGoToProjects={handleGoToProjects}
            onCreateProject={handleNewProject}
          />

          <section className="dashboard-section">
            <div className="page-header">
              <div>
                <h2>Aktive Projekte</h2>
                <p className="action-links-panel__description">
                  Wenige aktive Projekte bleiben direkt sichtbar statt hinter Suche oder Modulen.
                </p>
              </div>
              <button type="button" className="button button--secondary" onClick={handleGoToProjects}>
                Alle Projekte
              </button>
            </div>

            {activeProjects.length ? (
              <ProjectList projects={activeProjects} onProjectClick={handleOpenProject} />
            ) : (
              <p className="app-home__empty">Noch keine aktiven Projekte vorhanden.</p>
            )}
          </section>

          <div className="app-home__secondary-grid">
            <ActionLinksPanel
              title="Projektverwaltung"
              description="Seltene Verwaltungswege bleiben erreichbar, aber klar nachgeordnet."
              actions={projectManagement}
            />
            <ActionLinksPanel
              title="Stammdaten"
              description="Globale Daten werden bewusst kleiner und getrennt vom Arbeitsstart gehalten."
              actions={masterData}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
