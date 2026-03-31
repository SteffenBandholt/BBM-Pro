import { useState } from 'react';

function ProtocolTopRow({ top, selectedTopId, onSelectTop, collapsedTopIds, onToggleCollapse }) {
  const isSelected = selectedTopId === top.id;
  const isCollapsed = collapsedTopIds.has(top.id);
  const isTitle = top.level === 1;
  const hasChildren = Boolean(top.children?.length);
  const showChildren = hasChildren && (!isTitle || !isCollapsed);

  return (
    <li>
      <div className="protocol-top-row-shell">
        {isTitle ? (
          <button
            type="button"
            className="protocol-top-row-toggle"
            onClick={() => onToggleCollapse(top.id)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Familie von ${top.displayNumber} aufklappen` : `Familie von ${top.displayNumber} zuklappen`}
          >
            <span aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
          </button>
        ) : (
          <span className="protocol-top-row-toggle protocol-top-row-toggle--spacer" aria-hidden="true" />
        )}

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
      </div>
      {top.longtext ? <p className="protocol-top-row__text">{top.longtext}</p> : null}
      {showChildren ? (
        <ul className="protocol-top-children">
          {top.children.map((child) => (
            <ProtocolTopRow
              key={child.id}
              top={child}
              selectedTopId={selectedTopId}
              onSelectTop={onSelectTop}
              collapsedTopIds={collapsedTopIds}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function ProtocolTopList({ tops, selectedTopId, onSelectTop }) {
  const [collapsedTopIds, setCollapsedTopIds] = useState(() => new Set());

  const handleToggleCollapse = (topId) => {
    setCollapsedTopIds((current) => {
      const next = new Set(current);
      if (next.has(topId)) {
        next.delete(topId);
      } else {
        next.add(topId);
      }
      return next;
    });
  };

  if (!tops.length) {
    return <p className="protocol-empty-state">Noch keine TOPs vorhanden.</p>;
  }

  return (
    <ul className="protocol-top-list">
      {tops.map((top) => (
        <ProtocolTopRow
          key={top.id}
          top={top}
          selectedTopId={selectedTopId}
          onSelectTop={onSelectTop}
          collapsedTopIds={collapsedTopIds}
          onToggleCollapse={handleToggleCollapse}
        />
      ))}
    </ul>
  );
}
