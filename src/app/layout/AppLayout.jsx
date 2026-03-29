import { NavLink, Outlet } from 'react-router-dom';
import { getMainNavigationModules } from '../config/appModules.js';

export default function AppLayout() {
  const mainNavigationModules = getMainNavigationModules();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__app-name">BBM-Pro</span>
          <span className="topbar__app-subtitle">Projekt- und Arbeitsmodul</span>
        </div>
        <nav className="nav" aria-label="Hauptnavigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          {mainNavigationModules.map((module) => (
            <NavLink
              key={module.id}
              to={module.href}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {module.title}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
