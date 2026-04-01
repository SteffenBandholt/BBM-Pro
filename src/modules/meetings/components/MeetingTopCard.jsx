import MeetingTopStatusBadge from './MeetingTopStatusBadge.jsx';
import { getMeetingTopMoveTargetOptions } from '../data/meetingTopModel.js';

export default function MeetingTopCard({
  top,
  tops,
  isEditing,
  editingDraft,
  isChild = false,
  onStartEdit,
  onStartCreateChild,
  onMoveTop,
  moveTarget,
  onMoveTargetChange,
  onEditDraftChange,
  onCancelEdit,
  onSaveEdit,
}) {
  const moveOptions = getMeetingTopMoveTargetOptions(tops, top.id);

  return (
    <article className={isChild ? 'meeting-top-card meeting-top-card--child' : 'meeting-top-card'}>
      <div className="meeting-top-card__main">
        <div className="meeting-top-card__headline">
          <div>
            <div className="meeting-top-card__number">TOP {top.displayNumber}</div>
            <h3>{top.title}</h3>
          </div>
          <MeetingTopStatusBadge status={top.status} />
        </div>

        <div className="meeting-top-card__body">
          <p>{top.longtext || 'Keine Notiz hinterlegt.'}</p>
          <dl className="meeting-top-card__facts">
            <div>
              <dt>Verantwortlich</dt>
              <dd>{top.assignee || 'Offen'}</dd>
            </div>
            <div>
              <dt>Fällig</dt>
              <dd>{top.dueDate || 'Ohne Frist'}</dd>
            </div>
          </dl>
        </div>
      </div>
      {isEditing ? (
        <div className="meeting-top-card__edit">
          <label className="field">
            <span>Titel</span>
            <input value={editingDraft.title} onChange={(event) => onEditDraftChange('title', event.target.value)} />
          </label>
          <label className="field">
            <span>Notiz</span>
            <textarea rows={4} value={editingDraft.longtext} onChange={(event) => onEditDraftChange('longtext', event.target.value)} />
          </label>
          <label className="field">
            <span>Fällig</span>
            <input type="date" value={editingDraft.dueDate} onChange={(event) => onEditDraftChange('dueDate', event.target.value)} />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={editingDraft.status} onChange={(event) => onEditDraftChange('status', event.target.value)}>
              <option value="offen">Offen</option>
              <option value="in arbeit">In Arbeit</option>
              <option value="blockiert">Blockiert</option>
              <option value="verzug">Verzug</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </label>
          <div className="meeting-top-card__actions">
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
          <div className="meeting-top-card__actions">
            <button type="button" className="button button--secondary" onClick={() => onStartCreateChild(top.id)}>
              Unterpunkt
            </button>
            <button type="button" className="button button--secondary" onClick={() => onStartEdit(top)}>
              Bearbeiten
            </button>
            <button type="button" className="button button--secondary" onClick={() => onMoveTop(top.id, moveTarget || null)}>
              Verschieben
            </button>
            <button type="button" className="button button--secondary">
              Mehr
            </button>
          </div>
          {moveOptions.length ? (
            <div className="meeting-top-card__move">
              <label className="field meeting-top-card__move-field">
                <span>Ziel</span>
                <select value={moveTarget ?? ''} onChange={(event) => onMoveTargetChange(top.id, event.target.value)}>
                  {moveOptions.map((option) => (
                    <option key={`${top.id}-${option.value || 'root'}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}

