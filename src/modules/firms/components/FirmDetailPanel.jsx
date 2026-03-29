export default function FirmDetailPanel({ firm }) {
  return (
    <div>
      <div className="project-participants__card">
        <p className="project-participants__label">Firmendetails</p>
        <p className="project-participants__card-title">{firm.name}</p>
      </div>

      <div>
        <p className="project-participants__label">Mitarbeiter</p>
        <ul className="project-participants__employees">
          {firm.employees.map((employee) => (
            <li key={employee.id}>
              <article className="project-participants__employee-card">
                <p className="project-participants__employee-name">{employee.name}</p>
                <p className="project-participants__employee-role">{employee.role}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
