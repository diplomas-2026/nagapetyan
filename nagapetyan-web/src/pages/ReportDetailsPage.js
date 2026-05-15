import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Snackbar, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { MovementTimeline } from '../components/MovementTimeline';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getReportStatusLabel } from '../utils/labels';

function getStatusTone(report) {
  if (report?.deletedAt) {
    return { label: 'Удалено', color: 'default' };
  }
  if (report?.status === 'DELIVERED' && !report?.delayed) {
    return { label: 'Доставлено в срок', color: 'success' };
  }
  if (report?.status === 'DELAYED' || report?.delayed) {
    return { label: 'Есть задержка', color: 'warning' };
  }
  if (report?.status === 'CANCELED') {
    return { label: 'Отменено', color: 'error' };
  }
  return { label: 'В пути', color: 'success' };
}

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

  const statusTone = useMemo(() => getStatusTone(report), [report]);
  const routeLabel = `${report?.routeFrom || '-'} → ${report?.routeTo || '-'}`;
  const infoCards = useMemo(
    () => [
      { label: 'Номер', value: report?.shipmentNumber || '-' },
      { label: 'Маршрут', value: routeLabel },
      { label: 'Вес', value: formatWeight(report?.weight) },
      { label: 'Стоимость', value: formatMoney(report?.cost) },
      { label: 'Дата отправки', value: report?.shippedAt || '-' },
      { label: 'Плановая доставка', value: report?.plannedDeliveryDate || '-' },
    ],
    [report, routeLabel],
  );

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Details отправления"
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
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            background: report?.deletedAt
              ? 'linear-gradient(135deg, #3f3f46 0%, #71717a 55%, #f5f5f5 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 52%, #e0f2fe 100%)',
            color: '#fff',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={getReportStatusLabel(report?.status)} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
              <Chip label={statusTone.label} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
              {report?.deletedAt ? <Chip label="Скрыто из списков" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} /> : null}
            </Stack>
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.2 }}>
              Карточка отправления
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {report?.shipmentNumber || 'Отправление'}
            </Typography>
            <Typography sx={{ opacity: 0.88 }}>
              {routeLabel}
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {infoCards.map((item) => (
            <Card key={item.label} variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6">{item.value}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <Typography variant="h6">Подробности</Typography>
              <Typography color="text.secondary">
                Сводка по отправлению с ключевыми параметрами, статусом и служебными заметками.
              </Typography>
              <Stack spacing={1}>
                <Typography>
                  <strong>Статус:</strong> {getReportStatusLabel(report?.status)}
                </Typography>
                <Typography>
                  <strong>Фактическая доставка:</strong> {report?.deliveredAt || '-'}
                </Typography>
                <Typography>
                  <strong>Подразделение:</strong> {report?.responsibleDepartment || '-'}
                </Typography>
                <Typography>
                  <strong>Комментарий:</strong> {report?.note || '-'}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <MovementTimeline items={report?.movements || []} />
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </AppLayout>
  );
}
