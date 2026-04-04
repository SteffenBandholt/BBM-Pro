export default function FirmDetailPanel({ firm }) {
  return (
    <div>
      <div className="project-participants__card">
        <p className="project-participants__label">Firmendetails</p>
        <p className="project-participants__card-title">{firm.name}</p>
        {firm.shortLabel ? <p className="project-participants__card-placeholder">Kuerzel: {firm.shortLabel}</p> : null}
        <p className="project-participants__card-placeholder">Globale Firma</p>
      </div>

      <div>
        <p className="project-participants__label">Mitarbeiter</p>
        {firm.employees?.length ? (
          <ul className="project-participants__employees">
            {firm.employees.map((employee) => (
              <li key={employee.id}>
                <article className="project-participants__employee-card">
                  <p className="project-participants__employee-name">{employee.name}</p>
                  <p className="project-participants__employee-role">{employee.email || 'Keine E-Mail gepflegt'}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="project-participants__card-placeholder">Noch keine Mitarbeiter.</p>
        )}
      </div>
    </div>
  );
}
