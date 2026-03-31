import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectSummaryCard from '../modules/projects/components/ProjectSummaryCard.jsx';
import ProjectMeetingPanel from '../modules/projects/components/ProjectMeetingPanel.jsx';
import ProjectWorkspaceGrid from '../modules/projects/components/ProjectWorkspaceGrid.jsx';
import { projectWorkspaces } from '../modules/projects/data/projectWorkspaces.js';
import { useProjects } from '../modules/projects/hooks/useProjects.js';
import { useMeetings } from '../modules/meetings/hooks/useMeetings.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, error, updateProject } = useProjects();
  const { meetings, createMeeting } = useMeetings(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState('');

  const project = projects.find((item) => String(item.id) === String(projectId));
  const latestMeeting = useMemo(() => meetings[0] ?? null, [meetings]);

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

  const handleMeetingsClick = () => {
    navigate(`/projects/${projectId}/meetings`);
  };

  const handleOpenLatestMeeting = () => {
    if (!latestMeeting) {
      navigate(`/projects/${projectId}/meetings`);
      return;
    }

    navigate(`/meetings/${latestMeeting.id}`);
  };

  const handleNewMeeting = async () => {
    const createdMeeting = await createMeeting({
      title: `${project.name || 'Projekt'} - Besprechung`,
      date: new Date().toISOString().slice(0, 10),
    });
    navigate(`/meetings/${createdMeeting.id}`);
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
    <section className="page-section project-detail-page">
      <div className="project-detail-hero">
        <div>
          <p className="project-detail-hero__eyebrow">Projekt</p>
          <h1>{project.name || 'Projekt'}</h1>
          <p>
            {project.number ? `Nr. ${project.number}` : 'Ohne Projektnummer'} · {project.city || 'Ort offen'}
          </p>
        </div>
        <div className="project-detail-hero__actions">
          <button type="button" className="button" onClick={handleMeetingsClick}>
            Besprechungen öffnen
          </button>
          <button type="button" className="button button--secondary" onClick={handleBackClick}>
            Zurück zu Projekten
          </button>
        </div>
      </div>

      {localError ? <p className="form-error">{localError}</p> : null}

      <ProjectMeetingPanel
        project={project}
        latestMeeting={latestMeeting}
        onOpenMeetings={handleMeetingsClick}
        onNewMeeting={handleNewMeeting}
        onOpenLatestMeeting={handleOpenLatestMeeting}
      />

      <ProjectSummaryCard project={project} />

      {isEditing ? (
        <ProjectForm
          initialValues={project}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          submitLabel="Speichern"
        />
      ) : (
        <button type="button" className="button button--secondary" onClick={handleStartEdit}>
          Projekt bearbeiten
        </button>
      )}

      <ProjectWorkspaceGrid workspaces={projectWorkspaces} />
    </section>
  );
}
