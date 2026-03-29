import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import { useProjects } from '../modules/projects/hooks/useProjects.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
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
      <h1>Projekt-Details</h1>
      {localError ? <p className="form-error">{localError}</p> : null}
      {isEditing ? (
        <ProjectForm
          initialValues={project}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          submitLabel="Speichern"
        />
      ) : (
        <>
          <button type="button" className="button" onClick={handleStartEdit}>
            Bearbeiten
          </button>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{project.name || '-'}</dd>
            </div>
            <div>
              <dt>Nummer</dt>
              <dd>{project.number || '-'}</dd>
            </div>
            <div>
              <dt>Ort</dt>
              <dd>{project.city || '-'}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
