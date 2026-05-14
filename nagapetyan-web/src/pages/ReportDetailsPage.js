import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

export function ReportDetailsPage() {
  const navigate = useNavigate();
  const { organizationId, reportId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
  }, [organizationId, setOrganizationId]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    api.getReport(token, organizationId, reportId).then(setReport).catch((error) => setMessage(error.message));
  }, [organizationId, reportId, token]);

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Details отчета"
      user={user}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      actions={user?.role !== 'EMPLOYEE' ? (
        <Button component={Link} to={`/organizations/${organizationId}/reports/${reportId}/edit`} variant="contained" startIcon={<EditIcon />}>
          Редактировать
        </Button>
      ) : null}
    >
      <Stack spacing={3}>
        <Typography variant="h4">Отчет</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography>Номер: {report?.shipmentNumber || '-'}</Typography>
              <Typography>Маршрут: {report?.routeFrom || '-'} → {report?.routeTo || '-'}</Typography>
              <Typography>Статус: {report?.status || '-'}</Typography>
              <Typography>Дата отправки: {report?.shippedAt || '-'}</Typography>
              <Typography>Плановая доставка: {report?.plannedDeliveryDate || '-'}</Typography>
              <Typography>Фактическая доставка: {report?.deliveredAt || '-'}</Typography>
              <Typography>Подразделение: {report?.responsibleDepartment || '-'}</Typography>
              <Typography>Комментарий: {report?.note || '-'}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </AppLayout>
  );
}
