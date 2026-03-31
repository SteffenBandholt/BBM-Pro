import { useNavigate, useSearchParams } from 'react-router-dom';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectList from '../modules/projects/components/ProjectList.jsx';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreating = searchParams.get('mode') === 'create';

  const handleCreateClick = () => {
    navigate('/projects?mode=create');
  };

  const handleCancelCreate = () => {
    navigate('/projects');
  };

  const handleSubmitCreate = async (input) => {
    try {
      await createProject(input);
      navigate('/projects');
    } catch {
      // Fehler wird im Hook gesetzt und oben angezeigt.
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <section className="page-section">
      <div className="projects-hero">
        <div>
          <p className="projects-hero__eyebrow">Projekte als Einstieg in Besprechungen</p>
          <h1>Projekte</h1>
          <p>Wähle ein Projekt und springe direkt zur nächsten Besprechung oder zum Protokoll.</p>
        </div>
        <button type="button" className="button projects-hero__cta" onClick={handleCreateClick}>
          Neues Projekt
        </button>
      </div>

      {loading ? <p>Lade Projekte ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {isCreating ? <ProjectForm onSubmit={handleSubmitCreate} onCancel={handleCancelCreate} submitLabel="Projekt speichern" /> : null}
      {!loading && !error ? <ProjectList projects={projects} onProjectClick={handleProjectClick} /> : null}
    </section>
  );
}
