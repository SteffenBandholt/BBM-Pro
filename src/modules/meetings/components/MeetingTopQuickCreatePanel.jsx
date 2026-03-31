export default function MeetingTopQuickCreatePanel({
  draft,
  onFieldChange,
  onReset,
  onCreate,
  parentLabel,
}) {
  return (
    <aside className="meeting-quick-create">
      <div className="meeting-quick-create__header">
        <h2>Schnellerfassung</h2>
        <p>{parentLabel}</p>
      </div>

      <label className="field">
        <span>Titel</span>
        <input value={draft.title} onChange={(event) => onFieldChange('title', event.target.value)} />
      </label>
      <label className="field">
        <span>Notiz</span>
        <textarea rows={5} value={draft.longtext} onChange={(event) => onFieldChange('longtext', event.target.value)} />
      </label>
      <label className="field">
        <span>Verantwortlich</span>
        <input value={draft.assignee || ''} onChange={(event) => onFieldChange('assignee', event.target.value)} />
      </label>
      <label className="field">
        <span>Fällig</span>
        <input type="date" value={draft.dueDate} onChange={(event) => onFieldChange('dueDate', event.target.value)} />
      </label>
      <label className="field">
        <span>Status</span>
        <select value={draft.status} onChange={(event) => onFieldChange('status', event.target.value)}>
          <option value="neu">Neu</option>
          <option value="offen">Offen</option>
          <option value="kritisch">Kritisch</option>
          <option value="erledigt">Erledigt</option>
        </select>
      </label>
      <label className="field">
        <span>Einordnen unter</span>
        <input value={draft.parentLabel || 'Root-Ebene'} readOnly />
      </label>
      <div className="form-actions meeting-quick-create__actions">
        <button type="button" className="button button--secondary" onClick={onReset}>
          Zurücksetzen
        </button>
        <button type="button" className="button" onClick={onCreate}>
          TOP anlegen
        </button>
      </div>
    </aside>
  );
}
