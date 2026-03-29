import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layout/AppLayout.jsx';
import HomePage from '../../pages/HomePage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
