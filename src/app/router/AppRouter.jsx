import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layout/AppLayout.jsx';
import HomePage from '../../pages/HomePage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import ProjectDetailPage from '../../pages/ProjectDetailPage.jsx';
import DefectsPage from '../../modules/defects/pages/DefectsPage.jsx';
import ProjectParticipantsPage from '../../modules/projectParticipants/pages/ProjectParticipantsPage.jsx';
import FirmsPage from '../../modules/firms/pages/FirmsPage.jsx';
import ProjectMeetingsPage from '../../modules/meetings/pages/ProjectMeetingsPage.jsx';
import MeetingDetailPage from '../../modules/meetings/pages/MeetingDetailPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/participants" element={<ProjectParticipantsPage />} />
        <Route path="/projects/:projectId/meetings" element={<ProjectMeetingsPage />} />
        <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
        <Route path="/firms" element={<FirmsPage />} />
        <Route path="/defects" element={<DefectsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
