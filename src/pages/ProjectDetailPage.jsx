import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectSummaryCard from '../modules/projects/components/ProjectSummaryCard.jsx';
import ProjectWorkspaceGrid from '../modules/projects/components/ProjectWorkspaceGrid.jsx';
import { projectWorkspaces } from '../modules/projects/data/projectWorkspaces.js';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, error, updateProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState('');

  const project = projects.find((item) => String(item.id) === String(projectId));

  useEffect(() => {
    setIsEditing(false);
    setLocalError('');
  }, [projectId]);

  if (loading) {
    return <p>Lade Projekte ...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!project) {
    return <p>Projekt nicht gefunden.</p>;
  }

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleBackClick = () => {
    navigate('/projects');
  };

  const handleParticipantsClick = () => {
    navigate(`/projects/${projectId}/participants`);
  };

  const handleMeetingsClick = () => {
    navigate(`/projects/${projectId}/meetings`);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setLocalError('');
  };

  const handleSubmitEdit = async (input) => {
    try {
      await updateProject(projectId, input);
      setIsEditing(false);
      setLocalError('');
    } catch {
      setLocalError('Projekt konnte nicht gespeichert werden.');
    }
  };

  return (
    <section className="page-section">
      <button type="button" className="button button--secondary" onClick={handleBackClick}>
        Zurück zu Projekten
      </button>
      <button type="button" className="button" onClick={handleParticipantsClick}>
        Projektbeteiligte
      </button>
      <button type="button" className="button button--secondary" onClick={handleMeetingsClick}>
        Besprechungen
      </button>

      <div className="project-detail-header">
        <div>
          <h1>{project.name || 'Projekt'}</h1>
          <p>Projekt-Details</p>
        </div>
      </div>

      {localError ? <p className="form-error">{localError}</p> : null}

      <ProjectSummaryCard project={project} />

      {isEditing ? (
        <ProjectForm
          initialValues={project}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          submitLabel="Speichern"
        />
      ) : (
        <button type="button" className="button" onClick={handleStartEdit}>
          Bearbeiten
        </button>
      )}

      <ProjectWorkspaceGrid workspaces={projectWorkspaces} />
    </section>
  );
}
