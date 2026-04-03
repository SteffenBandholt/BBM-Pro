export default function FirmDetailPanel({ firm }) {
  return (
    <div>
      <div className="project-participants__card">
        <p className="project-participants__label">Firmendetails</p>
        <p className="project-participants__card-title">{firm.name}</p>
        {firm.shortLabel ? <p className="project-participants__card-placeholder">Kuerzel: {firm.shortLabel}</p> : null}
        <p className="project-participants__card-placeholder">Globale Firma</p>
      </div>
    </div>
  );
}
