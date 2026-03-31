import { useState } from 'react';

function formatCreatedAt(createdAt) {
  if (!createdAt) return '';

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date);
}

function ProtocolTopRow({ top, selectedTopId, onSelectTop, collapsedTopIds, onToggleCollapse }) {
  const isSelected = selectedTopId === top.id;
  const isCollapsed = collapsedTopIds.has(top.id);
  const isTitle = top.level === 1;
  const hasChildren = Boolean(top.children?.length);
  const showChildren = hasChildren && (!isTitle || !isCollapsed);
  const showCreatedAt = !isTitle && Boolean(top.createdAt);
  const createdAtLabel = showCreatedAt ? formatCreatedAt(top.createdAt) : '';
  const trafficLightClass =
    top.ampel === 'grün'
      ? 'protocol-top-row__traffic-light protocol-top-row__traffic-light--green'
      : top.ampel === 'rot'
        ? 'protocol-top-row__traffic-light protocol-top-row__traffic-light--red'
        : top.ampel === 'gelb'
          ? 'protocol-top-row__traffic-light protocol-top-row__traffic-light--yellow'
          : 'protocol-top-row__traffic-light';

  return (
    <li>
      <div className="protocol-top-entry">
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
            <span className="protocol-top-row__number-block">
              <span className="protocol-top-row__number">{top.displayNumber}</span>
              {showCreatedAt ? <span className="protocol-top-row__created-at">{createdAtLabel}</span> : null}
            </span>
            <span className="protocol-top-row__title-block">
              <span className="protocol-top-row__title">{top.title}</span>
              {!isTitle && top.longtext ? <span className="protocol-top-row__text">{top.longtext}</span> : null}
            </span>
            <span className="protocol-top-row__meta-column">
              <span className="protocol-top-row__meta protocol-top-row__meta--due">
                <span>{top.dueDate || 'ohne Termin'}</span>
                <span className={trafficLightClass} aria-hidden="true" />
              </span>
              <span className="protocol-top-row__meta">{top.status}</span>
              <span className="protocol-top-row__meta">{top.responsible || 'offen'}</span>
            </span>
          </button>
        </div>
      </div>
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
