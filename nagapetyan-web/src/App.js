import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { OrganizationDetailsPage } from './pages/OrganizationDetailsPage';
import { OrganizationFormPage } from './pages/OrganizationFormPage';
import { MemberDetailsPage } from './pages/MemberDetailsPage';
import { MemberFormPage } from './pages/MemberFormPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { ReportFormPage } from './pages/ReportFormPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cabinet" element={<Navigate to="/organizations" replace />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/new" element={<OrganizationFormPage mode="create" />} />
        <Route path="/organizations/:organizationId" element={<OrganizationDetailsPage />} />
        <Route path="/organizations/:organizationId/edit" element={<OrganizationFormPage mode="edit" />} />
        <Route path="/organizations/:organizationId/members/new" element={<MemberFormPage mode="create" />} />
        <Route path="/organizations/:organizationId/members/:memberId" element={<MemberDetailsPage />} />
        <Route path="/organizations/:organizationId/members/:memberId/edit" element={<MemberFormPage mode="edit" />} />
        <Route path="/organizations/:organizationId/reports/new" element={<ReportFormPage mode="create" />} />
        <Route path="/organizations/:organizationId/reports/:reportId" element={<ReportDetailsPage />} />
        <Route path="/organizations/:organizationId/reports/:reportId/edit" element={<ReportFormPage mode="edit" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
