import { getMeetingTopById } from '../data/meetingTopModel.js';

function ProtocolTopRow({ top, selectedTopId, onSelectTop }) {
  const isSelected = selectedTopId === top.id;

  return (
    <li>
      <button
        type="button"
        className={isSelected ? 'protocol-top-row protocol-top-row--selected' : 'protocol-top-row'}
        onClick={() => onSelectTop(top.id)}
      >
        <span className="protocol-top-row__number">{top.displayNumber}</span>
        <span className="protocol-top-row__title">{top.title}</span>
        <span className="protocol-top-row__meta-column">
          <span className="protocol-top-row__meta">{top.dueDate || 'ohne Termin'}</span>
          <span className="protocol-top-row__meta">{top.status}</span>
          <span className="protocol-top-row__meta">{top.responsible || 'offen'}</span>
        </span>
      </button>
      {top.longtext ? <p className="protocol-top-row__text">{top.longtext}</p> : null}
      {top.children?.length ? (
        <ul className="protocol-top-children">
          {top.children.map((child) => (
            <ProtocolTopRow key={child.id} top={child} selectedTopId={selectedTopId} onSelectTop={onSelectTop} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function ProtocolTopList({ tops, selectedTopId, onSelectTop }) {
  if (!tops.length) {
    return <p className="protocol-empty-state">Noch keine TOPs vorhanden.</p>;
  }

  return (
    <ul className="protocol-top-list">
      {tops.map((top) => (
        <ProtocolTopRow key={top.id} top={top} selectedTopId={selectedTopId} onSelectTop={onSelectTop} />
      ))}
    </ul>
  );
}
