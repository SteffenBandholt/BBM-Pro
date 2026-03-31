export default function ProtocolEditorPanel({
  title,
  draft,
  onFieldChange,
  onSave,
  onDelete,
  onToggleImportant,
  toolbar,
}) {
  const isTitleLevel = Boolean(draft.level === 1);

  return (
    <section className="protocol-editor-panel">
      <div className="protocol-editor-panel__header">
        <h2>{title}</h2>
        <div className="protocol-editor-panel__toolbar protocol-editor-panel__toolbar--centered">
          {toolbar}
          <button type="button" className="button button--secondary button--sm" onClick={onDelete} disabled={!draft.title}>
            Löschen
          </button>
          <button type="button" className="button button--primary button--sm" onClick={onSave}>
            Speichern
          </button>
        </div>
      </div>

      <div className="protocol-editor-layout">
        <div className="protocol-editor-main">
          <div className="protocol-editor-title-row">
            <label className="field protocol-editor-title-row__title">
              <span>Titel</span>
              <input value={draft.title} onChange={(event) => onFieldChange('title', event.target.value)} />
            </label>
            <label className="protocol-editor-title-row__flag protocol-editor-title-row__flag--inline">
              <input type="checkbox" checked={draft.isImportant} onChange={(event) => onToggleImportant(event.target.checked)} />
              <span>wichtig</span>
            </label>
          </div>

          {isTitleLevel ? null : (
            <div className="protocol-editor-longtext">
              <span className="protocol-editor-longtext__label">Langtext</span>
              <textarea rows={2} value={draft.longtext} onChange={(event) => onFieldChange('longtext', event.target.value)} />
            </div>
          )}
        </div>

        {isTitleLevel ? null : (
          <aside className="protocol-editor-meta-column">
            <div className="protocol-editor-meta-column__grid">
              <div className="protocol-editor-meta-column__row protocol-editor-meta-column__row--top">
                <label className="field protocol-editor-meta__date">
                  <span>Fertig bis</span>
                  <input type="date" value={draft.dueDate} onChange={(event) => onFieldChange('dueDate', event.target.value)} />
                </label>
                <button
                  type="button"
                  className={`protocol-editor-traffic-light protocol-editor-traffic-light--${draft.ampel || 'gelb'}`}
                  aria-label={`Ampel ${draft.ampel || 'gelb'}`}
                />
              </div>

              <label className="field protocol-editor-meta__status">
                <span>Status</span>
                <select value={draft.status} onChange={(event) => onFieldChange('status', event.target.value)}>
                  <option value="neu">Neu</option>
                  <option value="übernommen">Übernommen</option>
                  <option value="geändert">Geändert</option>
                  <option value="erledigt">Erledigt</option>
                </select>
              </label>

              <label className="field protocol-editor-meta__responsible">
                <span>Verantw.</span>
                <select value={draft.responsible} onChange={(event) => onFieldChange('responsible', event.target.value)}>
                  <option value="">Offen</option>
                  <option value="max">Max Müller</option>
                  <option value="anna">Anna Becker</option>
                  <option value="team">Projektteam</option>
                </select>
              </label>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
