export default function ProtocolBottomToolBar({
  tops,
  selectedTop,
  onStartRootCreate,
  onStartChildCreate,
  onStartSubChildCreate,
}) {
  const canCreateTop = selectedTop && Number(selectedTop.level) < 4;
  const canCreateUnder = selectedTop && Number(selectedTop.level) < 4;

  return (
    <>
      <button type="button" className="button button--toolbar button--sm" onClick={onStartRootCreate}>
        + Titel
      </button>
      <button
        type="button"
        className="button button--toolbar button--sm"
        onClick={onStartChildCreate}
        disabled={!canCreateTop}
      >
        + TOP
      </button>
      <button
        type="button"
        className="button button--toolbar button--sm"
        onClick={onStartSubChildCreate}
        disabled={!canCreateUnder}
      >
        + Unterpunkt
      </button>
      <button type="button" className="button button--toolbar button--sm" disabled={!selectedTop}>
        Schieben
      </button>
    </>
  );
}
