import { getTrafficLightTone } from '../data/meetingTrafficLight.js';

export default function ProtocolEditorPanel({
  title,
  draft,
  responsibleOptions = [],
  onFieldChange,
  onFieldBlur,
  onSave,
  onDelete,
  onCancel,
  onToggleImportant,
  toolbar,
  isReadOnly = false,
  canDelete = true,
  titleLocked = false,
  saveState = 'idle',
}) {
  const isTitleLevel = Boolean(draft.level === 1);
  const trafficLightTone = getTrafficLightTone(draft);
  const trafficLightClass = `protocol-editor-traffic-light${
    trafficLightTone ? ` protocol-editor-traffic-light--${trafficLightTone}` : ''
  }`;

  const disableTitle = isReadOnly || titleLocked;
  const hideMeta = isTitleLevel;

  return (
    <section className="protocol-editor-panel">
      <div className="protocol-editor-panel__header">
        <h2>{title}</h2>
        <div className="protocol-editor-panel__toolbar protocol-editor-panel__toolbar--centered">
          {toolbar}
          <span className="protocol-editor-save-status">
            {saveState === 'saving' ? 'speichert…' : null}
            {saveState === 'saved' ? 'gespeichert' : null}
            {saveState === 'error' ? 'Fehler' : null}
          </span>
          {onCancel ? (
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={onCancel}
              disabled={isReadOnly}
            >
              Abbrechen
            </button>
          ) : null}
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={onDelete}
            disabled={isReadOnly || !canDelete}
          >
            Loeschen
          </button>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={onSave}
            disabled={isReadOnly || !(draft.title || '').trim()}
          >
            Speichern
          </button>
        </div>
      </div>

      <div className="protocol-editor-layout">
        <div className="protocol-editor-main">
          <div className="protocol-editor-title-row">
            <label className="field protocol-editor-title-row__title">
              <span>Titel</span>
              <input
                value={draft.title}
                onChange={(event) => onFieldChange('title', event.target.value)}
                onBlur={(event) => onFieldBlur?.('title', event.target.value)}
                disabled={disableTitle}
              />
            </label>
          </div>

          {isTitleLevel ? null : (
            <label className="field protocol-editor-longtext">
              <span>Langtext</span>
              <textarea
                rows={2}
                value={draft.longtext}
                onChange={(event) => onFieldChange('longtext', event.target.value)}
                onBlur={(event) => onFieldBlur?.('longtext', event.target.value)}
                disabled={isReadOnly}
              />
            </label>
          )}
        </div>

        {hideMeta ? null : (
          <aside className="protocol-editor-meta-column">
            <div className="protocol-editor-meta-column__grid">
              <div className="protocol-editor-meta-column__row protocol-editor-meta-column__row--top">
                <label className="field protocol-editor-meta__date">
                  <span>Fertig bis</span>
                  <input
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) => onFieldChange('dueDate', event.target.value)}
                    disabled={isReadOnly}
                  />
                </label>
                <button
                  type="button"
                  className={trafficLightClass}
                  aria-label={trafficLightTone ? `Ampel ${trafficLightTone}` : 'Ampel'}
                  disabled
                />
              </div>

              <label className="field protocol-editor-meta__status">
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(event) => onFieldChange('status', event.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="offen">Offen</option>
                  <option value="in arbeit">In Arbeit</option>
                  <option value="blockiert">Blockiert</option>
                  <option value="verzug">Verzug</option>
                  <option value="erledigt">Erledigt</option>
                </select>
              </label>

              <label className="field protocol-editor-meta__responsible">
                <span>Verantw. Firma</span>
                <select
                  value={draft.responsibleId || ''}
                  onChange={(event) => {
                    const val = event.target.value;
                    onFieldChange('responsibleId', val);
                  }}
                  disabled={isReadOnly}
                >
                  <option value="">Offen</option>
                  {responsibleOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
