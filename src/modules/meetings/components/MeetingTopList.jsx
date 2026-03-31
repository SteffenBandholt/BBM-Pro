import MeetingTopCard from './MeetingTopCard.jsx';

function MeetingTopListNode({
  top,
  tops,
  editingTopId,
  editingDraft,
  onStartEdit,
  onStartCreateChild,
  onMoveTop,
  moveTargetByTopId,
  onMoveTargetChange,
  onEditDraftChange,
  onCancelEdit,
  onSaveEdit,
}) {
  return (
    <li>
      <MeetingTopCard
        top={top}
        tops={tops}
        isEditing={editingTopId === top.id}
        editingDraft={editingDraft}
        onStartEdit={onStartEdit}
        onStartCreateChild={onStartCreateChild}
        onMoveTop={onMoveTop}
        moveTarget={moveTargetByTopId[top.id]}
        onMoveTargetChange={onMoveTargetChange}
        onEditDraftChange={onEditDraftChange}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
      />
      {top.children?.length ? (
        <ul className="meeting-top-list meeting-top-list--children">
          {top.children.map((child) => (
            <MeetingTopListNode
              key={child.id}
              top={child}
              tops={tops}
              editingTopId={editingTopId}
              editingDraft={editingDraft}
              onStartEdit={onStartEdit}
              onStartCreateChild={onStartCreateChild}
              onMoveTop={onMoveTop}
              moveTargetByTopId={moveTargetByTopId}
              onMoveTargetChange={onMoveTargetChange}
              onEditDraftChange={onEditDraftChange}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function MeetingTopList({
  tops,
  editingTopId,
  editingDraft,
  onStartEdit,
  onStartCreateChild,
  onMoveTop,
  moveTargetByTopId,
  onMoveTargetChange,
  onEditDraftChange,
  onCancelEdit,
  onSaveEdit,
}) {
  if (!tops.length) {
    return <p className="meeting-empty-state">Noch keine TOPs vorhanden.</p>;
  }

  return (
    <ul className="meeting-top-list">
      {tops.map((top) => (
        <MeetingTopListNode
          key={top.id}
          top={top}
          tops={tops}
          editingTopId={editingTopId}
          editingDraft={editingDraft}
          onStartEdit={onStartEdit}
          onStartCreateChild={onStartCreateChild}
          onMoveTop={onMoveTop}
          moveTargetByTopId={moveTargetByTopId}
          onMoveTargetChange={onMoveTargetChange}
          onEditDraftChange={onEditDraftChange}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
        />
      ))}
    </ul>
  );
}
