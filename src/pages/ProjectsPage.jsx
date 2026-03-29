import { useState } from 'react';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectList from '../modules/projects/components/ProjectList.jsx';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectsPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSubmitCreate = async (input) => {
    await createProject(input);
    setIsCreating(false);
  };

  const handleProjectClick = (project) => {
    console.log('Projekt geklickt:', project);
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
