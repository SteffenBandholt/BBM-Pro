export default function MeetingFilterBar({ searchTerm, onSearchChange, activeFilter, onFilterChange }) {
  const filters = ['Alle', 'Offen', 'Kritisch', 'Meine'];

  return (
    <div className="meeting-filter-bar">
      <label className="field meeting-filter-bar__search">
        <span>Suche</span>
        <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="TOPs durchsuchen" />
      </label>
      <div className="meeting-filter-bar__chips">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === activeFilter ? 'meeting-filter-chip meeting-filter-chip--active' : 'meeting-filter-chip'}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
