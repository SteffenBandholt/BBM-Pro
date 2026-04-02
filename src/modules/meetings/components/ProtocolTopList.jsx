import { useState } from 'react';
import { getTrafficLightTone } from '../data/meetingTrafficLight.js';

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
  const trafficLightTone = getTrafficLightTone(top);
  const trafficLightClass = `protocol-top-row__traffic-light${
    trafficLightTone ? ` protocol-top-row__traffic-light--${trafficLightTone}` : ''
  }`;

  const originClass = isTitle ? '' : top.isCarriedOver ? 'protocol-top-row--carried' : 'protocol-top-row--new';
  const doneClass = !isTitle && top.status === 'erledigt' ? 'protocol-top-row--done' : '';

  const baseClass = isTitle ? 'protocol-top-row protocol-top-row--title' : 'protocol-top-row';
  const rowClassName = [baseClass, originClass, doneClass, isSelected ? 'protocol-top-row--selected' : '']
    .filter(Boolean)
    .join(' ');

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
              <span aria-hidden="true">{isCollapsed ? '>' : 'v'}</span>
            </button>
          ) : (
            <span className="protocol-top-row-toggle protocol-top-row-toggle--spacer" aria-hidden="true" />
          )}

          <button
            type="button"
            className={rowClassName}
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
            {isTitle ? null : (
              <span className="protocol-top-row__meta-column">
                <span className="protocol-top-row__meta protocol-top-row__meta--due">
                  <span>{top.dueDate || 'ohne Termin'}</span>
                  <span className={trafficLightClass} aria-hidden="true" />
                </span>
                <span className="protocol-top-row__meta">{top.status}</span>
                <span className="protocol-top-row__meta">{top.responsible || 'offen'}</span>
              </span>
            )}
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
