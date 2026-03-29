import DefectListItem from './DefectListItem.jsx';

export default function DefectsList({ defects }) {
  return (
    <div className="defects-list">
      {defects.map((defect) => (
        <DefectListItem key={defect.id} defect={defect} />
      ))}
    </div>
  );
}
