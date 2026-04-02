export default function ProtocolBottomToolBar({
  onStartTitleCreate,
  onStartTopCreate,
  canCreateTitle,
  canCreateTop,
  onToggleMove,
  moveMode,
  canMove,
}) {
  return (
    <div className="protocol-bottom-toolbar">
      <button
        type="button"
        className="button button--toolbar button--sm"
        onClick={onStartTitleCreate}
        disabled={!canCreateTitle}
      >
        + Titel
      </button>
      <button
        type="button"
        className="button button--toolbar button--sm"
        onClick={onStartTopCreate}
        disabled={!canCreateTop}
      >
        + TOP
      </button>
      <button
        type="button"
        className={`button button--toolbar button--sm${moveMode ? ' button--primary' : ''}`}
        onClick={onToggleMove}
        disabled={!canMove}
        title="Schieben: Ziel durch Klick in Liste waehlen"
      >
        {moveMode ? 'Schieben (aktiv)' : 'Schieben'}
      </button>
    </div>
  );
}
