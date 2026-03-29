import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader.jsx';
import ModuleNavigation from '../components/ModuleNavigation.jsx';
import RecentProjectsPanel from '../components/RecentProjectsPanel.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

export default function HomePage() {
  const navigate = useNavigate();
  const { modules, projects, loading, error } = useDashboard();

  const handleNewProject = () => {
    navigate('/projects?mode=create');
  };

  const handleGoToProjects = () => {
    navigate('/projects');
  };

  return (
    <section className="page-section">
      <DashboardHeader
        title="BBM-Pro"
        description="Schneller Einstieg in Projekte, Module und aktuelle Arbeitspunkte."
        onNewProject={handleNewProject}
        onGoToProjects={handleGoToProjects}
      />

      {loading ? <p>Lade Dashboard ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error ? (
        <>
          <ModuleNavigation modules={modules} />
          <RecentProjectsPanel projects={projects} />
        </>
      ) : null}
    </section>
  );
}
