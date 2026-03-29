import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectList from '../modules/projects/components/ProjectList.jsx';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSubmitCreate = async (input) => {
    try {
      await createProject(input);
      setIsCreating(false);
    } catch {
      // Fehler wird im Hook gesetzt und oben angezeigt.
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <h1>Projekte</h1>
        <button type="button" className="button" onClick={handleCreateClick}>
          Projekt anlegen
        </button>
      </div>

      {loading ? <p>Lade Projekte ...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {isCreating ? <ProjectForm onSubmit={handleSubmitCreate} onCancel={handleCancelCreate} /> : null}

      {!loading && !error ? <ProjectList projects={projects} onProjectClick={handleProjectClick} /> : null}
    </section>
  );
}
