import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { OrganizationAnalyticsPanel } from '../components/OrganizationAnalyticsPanel';
import { SummaryCards } from '../components/SummaryCards';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { useOrganizationDetails } from '../hooks/useOrganizationDetails';

export function OrganizationAnalyticsPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const { organization, dashboard, members, reports } = useOrganizationDetails(token, organizationId);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}/analytics`);
    }
  }

  const summaryCards = dashboard?.summary
    ? [
        { label: 'Всего отправлений', value: dashboard.summary.totalRecords },
        { label: 'Вовремя', value: dashboard.summary.deliveredOnTime },
        { label: 'С задержкой', value: dashboard.summary.delayed },
        { label: 'Процент вовремя', value: `${dashboard.summary.onTimePercent.toFixed(1)}%` },
        { label: 'Средний срок', value: `${dashboard.summary.averageTransitDays.toFixed(1)} дн.` },
      ]
    : [];

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={organization ? `${organization.name} · Аналитика` : 'Аналитика организации'}
      user={user}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      actions={
        <Stack direction="row" spacing={1}>
          <Button component={Link} to={`/organizations/${organizationId}`} reloadDocument variant="outlined" startIcon={<ArrowBackIcon />}>
            К организации
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                Аналитика организации
              </Typography>
              <Typography color="text.secondary">
                Здесь собраны графики, статистика и сводные показатели по отправлениям и сотрудникам.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <SummaryCards items={summaryCards} />

        <OrganizationAnalyticsPanel dashboard={dashboard} members={members} reports={reports} />
      </Stack>
    </AppLayout>
  );
}
