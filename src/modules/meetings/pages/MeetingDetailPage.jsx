import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addMeetingTop,
  buildMeetingTopTree,
  canDeleteMeetingTop,
  canMoveMeetingTop,
  createEmptyTopDraft,
  createInitialMeetingTops,
  deleteMeetingTop,
  findMeetingTopNodeById,
  getMeetingTopMoveTargetOptions,
  moveMeetingTop,
  updateMeetingTop,
} from '../data/meetingTopModel.js';

const TOP_STATUS_OPTIONS = ['neu', 'erledigt'];

function MeetingTopFields({ draft, onFieldChange, titleReadOnly = false, readOnlyNote = '' }) {
  const manualStatusValue = TOP_STATUS_OPTIONS.includes(draft.status) ? draft.status : 'neu';

  return (
    <>
      <label className="field">
        <span>Titel</span>
        <input
          value={draft.title}
          readOnly={titleReadOnly}
          onChange={(event) => onFieldChange('title', event.target.value)}
        />
      </label>

      {readOnlyNote ? <p className="meeting-top-card__note">{readOnlyNote}</p> : null}

      <label className="field">
        <span>Langtext</span>
        <textarea
          rows={4}
          value={draft.longtext}
          onChange={(event) => onFieldChange('longtext', event.target.value)}
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select value={manualStatusValue} onChange={(event) => onFieldChange('status', event.target.value)}>
          {TOP_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Fällig am</span>
        <input
          type="date"
          value={draft.dueDate}
          onChange={(event) => onFieldChange('dueDate', event.target.value)}
        />
      </label>

      <label className="meeting-top-card__checkbox">
        <input
          type="checkbox"
          checked={draft.isImportant}
          onChange={(event) => onFieldChange('isImportant', event.target.checked)}
        />
        <span>Wichtig</span>
      </label>

      <label className="meeting-top-card__checkbox">
        <input
          type="checkbox"
          checked={draft.isHidden}
          onChange={(event) => onFieldChange('isHidden', event.target.checked)}
        />
        <span>Hidden</span>
      </label>
    </>
  );
}

function MeetingTopTree({
  nodes,
  tops,
  isMeetingClosed,
  editingTopId,
  editingDraft,
  onFieldChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteTop,
  onStartCreateChild,
  moveTargetByTopId,
  setMoveTargetByTopId,
  onMoveTop,
  isChildList = false,
}) {
  return (
    <ul className={isChildList ? 'meeting-top-list meeting-top-list--children' : 'meeting-top-list'}>
      {nodes.map((top) => {
        const isEditing = editingTopId === top.id;
        const moveOptions = getMeetingTopMoveTargetOptions(tops, top.id);
        const storedMoveTarget = moveTargetByTopId[top.id];
        const selectedMoveTarget = moveOptions.some((option) => option.value === storedMoveTarget)
          ? storedMoveTarget
          : moveOptions[0]?.value ?? '';
        const canMove = canMoveMeetingTop(
          tops,
          top.id,
          isMeetingClosed,
          selectedMoveTarget === '' ? null : selectedMoveTarget,
        );

        return (
          <li key={top.id}>
            <article
              className={[
                'meeting-top-card',
                top.level === 1 ? 'meeting-top-card--level-1' : '',
                top.isCarriedOver ? 'meeting-top-card--carryover' : '',
                top.isImportant ? 'meeting-top-card--important' : '',
                top.status === 'erledigt' ? 'meeting-top-card--done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="meeting-top-card__header">
                <div>
                  <span className="meeting-top-card__number">{top.displayNumber}</span>
                  <span className="meeting-top-card__title">{top.title}</span>
                </div>
              </div>

              {isEditing ? (
                <div className="meeting-top-card__edit">
                  <MeetingTopFields
                    draft={editingDraft}
                    onFieldChange={onFieldChange}
                    titleReadOnly={top.isCarriedOver && !isMeetingClosed}
                    readOnlyNote={
                      top.isCarriedOver && !isMeetingClosed
                        ? 'Titel ist gesperrt, weil der TOP übernommen wurde.'
                        : ''
                    }
                  />

                  <div className="form-actions">
                    <button type="button" className="button" onClick={() => onSaveEdit(top.id)}>
                      Speichern
                    </button>
                    <button type="button" className="button button--secondary" onClick={onCancelEdit}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="meeting-top-card__meta">
                    <span className="meeting-top-card__badge">Ebene {top.level}</span>
                    <span className="meeting-top-card__badge">Status: {top.status}</span>
                    <span className="meeting-top-card__badge">
                      {top.isCarriedOver ? 'Übernommen' : 'Neu'}
                    </span>
                    {top.isTouched ? (
                      <span className="meeting-top-card__badge meeting-top-card__badge--touched">
                        Geändert
                      </span>
                    ) : null}
                    {top.isImportant ? (
                      <span className="meeting-top-card__badge meeting-top-card__badge--important">
                        Wichtig
                      </span>
                    ) : null}
                  </div>

                  <p className="meeting-top-card__text">{top.longtext || 'Kein Langtext hinterlegt.'}</p>

                  {!isMeetingClosed ? (
                    <div className="meeting-top-card__actions">
                      <button type="button" className="button" onClick={() => onStartEdit(top)}>
                        Bearbeiten
                      </button>

                      {top.level < 4 ? (
                        <button
                          type="button"
                          className="button button--secondary"
                          onClick={() => onStartCreateChild(top.id)}
                        >
                          Unterpunkt hinzufügen
                        </button>
                      ) : null}

                      {canDeleteMeetingTop(tops, top.id, isMeetingClosed) ? (
                        <button
                          type="button"
                          className="button button--secondary"
                          onClick={() => onDeleteTop(top.id)}
                        >
                          Löschen
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {!isMeetingClosed && moveOptions.length > 0 ? (
                    <div className="meeting-top-card__move">
                      <label className="field meeting-top-card__move-field">
                        <span>Verschieben nach</span>
                          <select
                          value={selectedMoveTarget}
                          onChange={(event) => setMoveTargetByTopId(top.id, event.target.value)}
                        >
                          {moveOptions.map((option) => (
                            <option key={`${top.id}-${option.value || 'root'}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="button button--secondary"
                        disabled={!canMove}
                        onClick={() => onMoveTop(top.id, selectedMoveTarget === '' ? null : selectedMoveTarget)}
                      >
                        Verschieben
                      </button>
                    </div>
                  ) : null}
                </>
              )}

              {top.children.length > 0 ? (
                <div className="meeting-top-card__children">
                  <MeetingTopTree
                    nodes={top.children}
                    tops={tops}
                    isMeetingClosed={isMeetingClosed}
                    editingTopId={editingTopId}
                    editingDraft={editingDraft}
                    onFieldChange={onFieldChange}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onSaveEdit={onSaveEdit}
                    onDeleteTop={onDeleteTop}
                    onStartCreateChild={onStartCreateChild}
                    moveTargetByTopId={moveTargetByTopId}
                    setMoveTargetByTopId={setMoveTargetByTopId}
                    onMoveTop={onMoveTop}
                    isChildList
                  />
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState({
    id: meetingId,
    number: `#${meetingId}`,
    date: new Date().toISOString().slice(0, 10),
    keyword: '',
    isClosed: false,
  });
  const [participants, setParticipants] = useState([]);
  const [tops, setTops] = useState(() => createInitialMeetingTops());
  const [newTopParentId, setNewTopParentId] = useState(null);
  const [newTopDraft, setNewTopDraft] = useState(() => createEmptyTopDraft());
  const [editingTopId, setEditingTopId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [moveTargetByTopId, setMoveTargetByTopId] = useState({});
  const isMeetingClosed = meeting.isClosed;

  const availableParticipants = [
    { id: 1, name: 'Max Müller', firmName: 'Bauunternehmen Müller' },
    { id: 2, name: 'Anna Becker', firmName: 'Bauunternehmen Müller' },
  ];

  const topTree = useMemo(() => buildMeetingTopTree(tops), [tops]);
  const selectedCreateParent = useMemo(
    () => (newTopParentId ? findMeetingTopNodeById(topTree, newTopParentId) : null),
    [newTopParentId, topTree],
  );

  const addParticipant = (participant) => {
    if (isMeetingClosed) {
      return;
    }

    setParticipants((currentParticipants) => {
      if (currentParticipants.some((current) => current.id === participant.id)) {
        return currentParticipants;
      }

      return [...currentParticipants, participant];
    });
  };

  const removeParticipant = (participantId) => {
    if (isMeetingClosed) {
      return;
    }

    setParticipants((currentParticipants) =>
      currentParticipants.filter((participant) => participant.id !== participantId),
    );
  };

  const handleCreateDraftChange = (field, value) => {
    setNewTopDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const handleCreateTop = () => {
    if (isMeetingClosed || !newTopDraft.title.trim()) {
      return;
    }

    setTops((currentTops) =>
      addMeetingTop(currentTops, {
        ...newTopDraft,
        title: newTopDraft.title.trim(),
        parentTopId: selectedCreateParent ? newTopParentId : null,
      }),
    );
    setNewTopDraft(createEmptyTopDraft());
    setNewTopParentId(null);
  };

  const handleStartCreateChild = (parentTopId) => {
    if (isMeetingClosed) {
      return;
    }

    setEditingTopId(null);
    setEditingDraft(null);
    setNewTopParentId(parentTopId);
  };

  const handleStartEdit = (top) => {
    if (isMeetingClosed) {
      return;
    }

    setNewTopParentId(null);
    setEditingTopId(top.id);
    setEditingDraft({
      title: top.title,
      longtext: top.longtext ?? '',
      dueDate: top.dueDate ?? '',
      status: top.status,
      isImportant: top.isImportant,
      isHidden: top.isHidden,
    });
  };

  const handleEditDraftChange = (field, value) => {
    setEditingDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingTopId(null);
    setEditingDraft(null);
  };

  const handleSaveEdit = (topId) => {
    if (isMeetingClosed || !editingDraft) {
      return;
    }

    setTops((currentTops) => updateMeetingTop(currentTops, topId, editingDraft));
    handleCancelEdit();
  };

  const handleDeleteTop = (topId) => {
    if (isMeetingClosed || !canDeleteMeetingTop(tops, topId, isMeetingClosed)) {
      return;
    }

    setTops((currentTops) => deleteMeetingTop(currentTops, topId));
    setMoveTargetByTopId((currentTargets) => {
      const nextTargets = { ...currentTargets };
      delete nextTargets[topId];
      return nextTargets;
    });

    if (editingTopId === topId) {
      handleCancelEdit();
    }
  };

  const handleMoveTop = (topId, targetParentId) => {
    if (isMeetingClosed || !canMoveMeetingTop(tops, topId, isMeetingClosed, targetParentId)) {
      return;
    }

    setTops((currentTops) => moveMeetingTop(currentTops, topId, targetParentId));
  };

  const handleMoveTargetChange = (topId, value) => {
    setMoveTargetByTopId((currentTargets) => ({
      ...currentTargets,
      [topId]: value,
    }));
  };

  const handleMeetingChange = (field, value) => {
    setMeeting((currentMeeting) => ({
      ...currentMeeting,
      [field]: value,
    }));
  };

  return (
    <section className="page-section">
      <div className="meeting-detail__header">
        <div>
          <h1>Besprechung</h1>
          <p className="meeting-detail__meta">Protokollnummer: {meeting.number}</p>
          <label className="field">
            <span>Datum</span>
            <input
              type="date"
              value={meeting.date}
              disabled={isMeetingClosed}
              onChange={(event) => handleMeetingChange('date', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Schlagwort</span>
            <input
              value={meeting.keyword}
              onChange={(event) => handleMeetingChange('keyword', event.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setMeeting((current) => ({ ...current, isClosed: !current.isClosed }))}
        >
          {isMeetingClosed ? 'Besprechung öffnen' : 'Besprechung schließen'}
        </button>
      </div>

      <section className="project-participants__panel">
        <h2>Teilnehmer</h2>

        <div>
          <p className="project-participants__label">Verfügbare Teilnehmer</p>
          <ul className="project-participants__employees">
            {availableParticipants.map((participant) => (
              <li key={participant.id}>
                <article className="project-participants__employee-card">
                  <p className="project-participants__employee-name">{participant.name}</p>
                  <p className="project-participants__employee-role">{participant.firmName}</p>
                  {!isMeetingClosed ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => addParticipant(participant)}
                    >
                      Hinzufügen
                    </button>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="project-participants__label">Ausgewählte Teilnehmer</p>
          <ul className="project-participants__employees">
            {participants.map((participant) => (
              <li key={participant.id}>
                <article className="project-participants__employee-card">
                  <p className="project-participants__employee-name">{participant.name}</p>
                  <p className="project-participants__employee-role">{participant.firmName}</p>
                  {!isMeetingClosed ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => removeParticipant(participant.id)}
                    >
                      Entfernen
                    </button>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="project-participants__panel meeting-top-create">
        <div className="meeting-top-create__header">
          <h2>{selectedCreateParent ? 'Unterpunkt hinzufügen' : 'Neuen Titel hinzufügen'}</h2>
          {selectedCreateParent ? (
            <button type="button" className="button button--secondary" onClick={() => setNewTopParentId(null)}>
              Zur Root-Ebene
            </button>
          ) : null}
        </div>

        <p className="meeting-top-create__context">
          {selectedCreateParent
            ? `Aktuelle Zielgruppe: ${selectedCreateParent.displayNumber} ${selectedCreateParent.title}`
            : 'Aktuelle Zielgruppe: Root-Ebene'}
        </p>

        {!isMeetingClosed ? (
          <>
            <MeetingTopFields draft={newTopDraft} onFieldChange={handleCreateDraftChange} />

            <div className="form-actions">
              <button type="button" className="button" onClick={handleCreateTop}>
                {selectedCreateParent ? 'Unterpunkt hinzufügen' : 'Titel hinzufügen'}
              </button>
            </div>
          </>
        ) : (
          <p>Diese Besprechung ist geschlossen. Neue TOPs können nicht angelegt werden.</p>
        )}
      </section>

      <section className="project-participants__panel">
        <h2>TOPs</h2>

        {topTree.length > 0 ? (
          <MeetingTopTree
            nodes={topTree}
            tops={tops}
            isMeetingClosed={isMeetingClosed}
            editingTopId={editingTopId}
            editingDraft={editingDraft}
            onFieldChange={handleEditDraftChange}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onDeleteTop={handleDeleteTop}
            onStartCreateChild={handleStartCreateChild}
            moveTargetByTopId={moveTargetByTopId}
            setMoveTargetByTopId={handleMoveTargetChange}
            onMoveTop={handleMoveTop}
          />
        ) : (
          <p>Keine TOPs vorhanden.</p>
        )}
      </section>
    </section>
  );
}
