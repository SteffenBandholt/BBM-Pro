import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMeetings } from '../modules/meetings/hooks/useMeetings.js';
import ProjectForm from '../modules/projects/components/ProjectForm.jsx';
import ProjectHomeHeader from '../modules/projects/components/ProjectHomeHeader.jsx';
import ProjectPrimaryActions from '../modules/projects/components/ProjectPrimaryActions.jsx';
import ProjectSummaryCard from '../modules/projects/components/ProjectSummaryCard.jsx';
import { useProjects } from '../modules/projects/hooks/useProjects.js';
import {
  getLastActivityLabel,
  getLatestMeetingLabel,
  getProjectLatestMeeting,
  getProjectOpenMeeting,
  rememberProjectVisit,
} from '../modules/projects/services/projectStartService.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, loading, error, updateProject } = useProjects();
  const { meetings, createMeeting } = useMeetings(projectId);
  const [localError, setLocalError] = useState('');

  const isEditing = searchParams.get('mode') === 'edit';
  const project = projects.find((item) => String(item.id) === String(projectId));
  const latestMeeting = useMemo(() => getProjectLatestMeeting(meetings), [meetings]);
  const openMeeting = useMemo(() => getProjectOpenMeeting(meetings), [meetings]);
  const latestMeetingLabel = useMemo(() => getLatestMeetingLabel(latestMeeting), [latestMeeting]);
  const lastActivityLabel = useMemo(
    () => getLastActivityLabel(project, latestMeeting),
    [latestMeeting, project],
  );

  useEffect(() => {
    setLocalError('');
  }, [isEditing, projectId]);

  useEffect(() => {
    if (project?.id) {
      rememberProjectVisit(project.id);
    }
  }, [project?.id]);

  if (loading) {
    return <p>Lade Projekte ...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!project) {
    return <p>Projekt nicht gefunden.</p>;
  }

  const openProjectEdit = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('mode', 'edit');
    setSearchParams(nextSearchParams);
  };

  const closeProjectEdit = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('mode');
    setSearchParams(nextSearchParams);
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

  const handleOpenWorkingMeeting = async () => {
    if (openMeeting) {
      navigate(`/meetings/${openMeeting.id}`);
      return;
    }

    try {
      const createdMeeting = await createMeeting({
        title: `${project.name || 'Projekt'} - Besprechung`,
        date: todayIso(),
      });
      navigate(`/meetings/${createdMeeting.id}`);
    } catch {
      setLocalError('Protokoll konnte nicht geoeffnet werden.');
    }
  };

  const handleCancelEdit = () => {
    closeProjectEdit();
    setLocalError('');
  };

  const handleSubmitEdit = async (input) => {
    try {
      await updateProject(projectId, input);
      closeProjectEdit();
      setLocalError('');
    } catch (err) {
      setLocalError(err?.message || 'Projekt konnte nicht gespeichert werden.');
    }
  };

  const primaryActions = [
    {
      id: 'protocol',
      title: 'Protokoll',
      description: 'Laufendes Protokoll oeffnen oder direkt die naechste Besprechung starten.',
      note: openMeeting ? 'Oeffnet das laufende Protokoll.' : 'Legt bei Bedarf eine neue Besprechung an.',
      onClick: () => {
        void handleOpenWorkingMeeting();
      },
    },
    {
      id: 'todo',
      title: 'Restarbeiten',
      description: 'Offene Punkte ohne Umweg direkt im aktuellen Arbeitskontext weiterfuehren.',
      note: 'Aktuell im Protokoll-Workflow verankert.',
      onClick: () => {
        void handleOpenWorkingMeeting();
      },
    },
    {
      id: 'defects',
      title: 'Maengel',
      description: 'Direkt in die Maengelansicht des Projekts springen.',
      note: 'Oeffnet die aktuelle Maengelansicht.',
      onClick: () => navigate(`/defects?projectId=${projectId}`),
    },
    {
      id: 'records',
      title: 'Aktenvermerke',
      description: 'Projektbezogene Vermerke ohne Zusatzebene sofort ansteuern.',
      note: 'Aktuell ueber den Protokoll-Workflow erreichbar.',
      onClick: () => {
        void handleOpenWorkingMeeting();
      },
    },
  ];

  return (
    <section className="page-section project-detail-page project-home-page">
      <div className="project-home-topbar">
        <button type="button" className="button button--secondary" onClick={handleBackClick}>
          Zurueck zu Projekten
        </button>
        <button type="button" className="button button--secondary" onClick={handleMeetingsClick}>
          Besprechungsverlauf
        </button>
      </div>

      <ProjectHomeHeader
        project={project}
        latestMeetingLabel={latestMeetingLabel}
        lastActivityLabel={lastActivityLabel}
      />

      {localError ? <p className="form-error">{localError}</p> : null}

      <ProjectPrimaryActions actions={primaryActions} />

      <section className="project-home-secondary">
        <div className="page-header">
          <div>
            <h2>Weitere Projektaktionen</h2>
            <p className="action-links-panel__description">
              Verwaltungswege bleiben bewusst nachgeordnet und trennen sich von den direkten Arbeitswegen.
            </p>
          </div>
        </div>

        <div className="project-home-secondary__actions">
          <button type="button" className="button button--secondary" onClick={handleOpenLatestMeeting}>
            Letzte Besprechung oeffnen
          </button>
          <button type="button" className="button button--secondary" onClick={openProjectEdit}>
            Projektdaten bearbeiten
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => navigate(`/projects/${projectId}/participants`)}
          >
            Beteiligte / Firmen
          </button>
        </div>
      </section>

      <ProjectSummaryCard project={project} />

      {isEditing ? (
        <ProjectForm
          initialValues={project}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          submitLabel="Speichern"
        />
      ) : (
        <button type="button" className="button button--secondary" onClick={openProjectEdit}>
          Projekt bearbeiten
        </button>
      )}
    </section>
  );
}
