import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Projekte
          </NavLink>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
