export default function ProtocolBottomToolBar({
  tops,
  selectedTop,
  onStartRootCreate,
  onStartChildCreate,
}) {
  return (
    <>
      <button type="button" className="button button--toolbar button--sm" onClick={onStartRootCreate} disabled={!selectedTop}>
        + Titel
      </button>
      <button type="button" className="button button--toolbar button--sm" onClick={onStartChildCreate} disabled={!selectedTop}>
        + TOP
      </button>
      <button type="button" className="button button--toolbar button--sm" disabled={!selectedTop}>
        Schieben
      </button>
    </>
  );
}
