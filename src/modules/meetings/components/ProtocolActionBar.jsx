export default function ProtocolActionBar({ protocolLabel, isClosed, onEndProtocol, onClose }) {
  return (
    <div className="protocol-action-bar">
      <div className={isClosed ? 'protocol-action-bar__label protocol-action-bar__label--closed' : 'protocol-action-bar__label'}>
        {protocolLabel}
        {isClosed ? ' - read only !' : ''}
      </div>
      <div className="protocol-action-bar__actions">
        <button type="button" className="button button--sm button--primary" onClick={onEndProtocol}>
          Protokoll beenden
        </button>
        <button type="button" className="button button--secondary button--sm button--toolbar" onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>
  );
}
