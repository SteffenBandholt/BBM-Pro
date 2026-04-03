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
      {loading ? <p>Lade Startseite ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="app-home__main-grid">
            <LastProjectPanel
              project={lastProject}
              onOpenProject={handleOpenProject}
              onCreateProject={handleNewProject}
            />

            <section className="dashboard-section app-home__projects">
              <div className="page-header app-home__section-header">
                <h2>Aktive Projekte</h2>
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
          </div>

          <div className="app-home__secondary-grid">
            <ActionLinksPanel
              title="Projektverwaltung"
              actions={projectManagement}
            />
            <ActionLinksPanel
              title="Stammdaten"
              actions={masterData}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
