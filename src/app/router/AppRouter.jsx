import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layout/AppLayout.jsx';
import HomePage from '../../pages/HomePage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import ProjectDetailPage from '../../pages/ProjectDetailPage.jsx';
import DefectsPage from '../../modules/defects/pages/DefectsPage.jsx';
import ProjectParticipantsPage from '../../modules/projectParticipants/pages/ProjectParticipantsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/participants" element={<ProjectParticipantsPage />} />
        <Route path="/defects" element={<DefectsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
