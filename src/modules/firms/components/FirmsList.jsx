import FirmListItem from './FirmListItem.jsx';

export default function FirmsList({ firms, selectedFirm, setSelectedFirm }) {
  return (
    <div className="project-participants__list">
      {firms.map((firm) => (
        <FirmListItem
          key={firm.id}
          firm={firm}
          isSelected={selectedFirm?.id === firm.id}
          onClick={() => setSelectedFirm(firm)}
        />
      ))}
    </div>
  );
}
