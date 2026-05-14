import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { OrganizationDetailsPage } from './pages/OrganizationDetailsPage';
import { OrganizationFormPage } from './pages/OrganizationFormPage';
import { MemberDetailsPage } from './pages/MemberDetailsPage';
import { MemberFormPage } from './pages/MemberFormPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { ReportFormPage } from './pages/ReportFormPage';
import { ReportImportPage } from './pages/ReportImportPage';
import { SessionProvider, useSession } from './hooks/useSession';

function RequireAuth({ children }) {
  const { token, user } = useSession();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route
            path="/cabinet"
            element={
              <RequireAuth>
                <Navigate to="/organizations" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations"
            element={
              <RequireAuth>
                <OrganizationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/new"
            element={
              <RequireAuth>
                <OrganizationFormPage mode="create" />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId"
            element={
              <RequireAuth>
                <OrganizationDetailsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/edit"
            element={
              <RequireAuth>
                <OrganizationFormPage mode="edit" />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/members/new"
            element={
              <RequireAuth>
                <MemberFormPage mode="create" />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/members/:memberId"
            element={
              <RequireAuth>
                <MemberDetailsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/members/:memberId/edit"
            element={
              <RequireAuth>
                <MemberFormPage mode="edit" />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/reports/new"
            element={
              <RequireAuth>
                <ReportFormPage mode="create" />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/reports/import"
            element={
              <RequireAuth>
                <ReportImportPage />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/reports/:reportId"
            element={
              <RequireAuth>
                <ReportDetailsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/organizations/:organizationId/reports/:reportId/edit"
            element={
              <RequireAuth>
                <ReportFormPage mode="edit" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
