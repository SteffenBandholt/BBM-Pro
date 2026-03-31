export default function ProtocolActionBar({ onToggleView, onEndProtocol, onClose }) {
  return (
    <div className="protocol-action-bar">
      <button type="button" className="button button--secondary button--sm button--toolbar" onClick={onToggleView}>
        Ansicht
      </button>
      <button type="button" className="button button--sm button--primary" onClick={onEndProtocol}>
        Protokoll beenden
      </button>
      <button type="button" className="button button--secondary button--sm button--toolbar" onClick={onClose}>
        Schließen
      </button>
    </div>
  );
}
