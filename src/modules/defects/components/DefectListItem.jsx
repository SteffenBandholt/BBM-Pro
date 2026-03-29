export default function DefectListItem({ defect }) {
  return (
    <article className="defect-card">
      <span className="defect-card__title">{defect.title}</span>
      <span className="defect-card__meta">Status: {defect.status}</span>
      <span className="defect-card__meta">Priorität: {defect.priority}</span>
    </article>
  );
}
