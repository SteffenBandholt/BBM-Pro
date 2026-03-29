export default function FirmListItem({ firm, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={isSelected ? 'project-participants__firm-button project-participants__firm-button--active' : 'project-participants__firm-button'}
      onClick={onClick}
    >
      <span className="project-participants__firm-name">{firm.name}</span>
      <span className="project-participants__firm-meta">{firm.employees.length} Mitarbeiter</span>
    </button>
  );
}
