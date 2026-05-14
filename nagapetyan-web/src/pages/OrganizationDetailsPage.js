import { useState } from 'react';
import { useEffect } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { SectionTabs } from '../components/SectionTabs';
import { SummaryCards } from '../components/SummaryCards';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { useOrganizationDetails } from '../hooks/useOrganizationDetails';

export function OrganizationDetailsPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const { organization, dashboard, members, reports } = useOrganizationDetails(token, organizationId);
  const [tab, setTab] = useState('overview');

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

  const summaryCards = dashboard?.summary
    ? [
        { label: 'Всего записей', value: dashboard.summary.totalRecords },
        { label: 'Вовремя', value: dashboard.summary.deliveredOnTime },
        { label: 'С задержкой', value: dashboard.summary.delayed },
        { label: 'Процент вовремя', value: `${dashboard.summary.onTimePercent.toFixed(1)}%` },
        { label: 'Средний срок', value: `${dashboard.summary.averageTransitDays.toFixed(1)} дн.` },
      ]
    : [];

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={organization ? organization.name : 'Details организации'}
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
          {user?.role === 'SYSTEM_ADMIN' ? (
            <Button component={Link} to={`/organizations/${organizationId}/edit`} variant="outlined" startIcon={<EditIcon />}>
              Редактировать
            </Button>
          ) : null}
          {user?.role !== 'EMPLOYEE' ? (
            <>
              <Button component={Link} to={`/organizations/${organizationId}/members/new?role=OWNER`} variant="outlined" startIcon={<AddIcon />}>
                Владелец
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/members/new?role=EMPLOYEE`} variant="outlined" startIcon={<AddIcon />}>
                Сотрудник
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/reports/new`} variant="contained" startIcon={<AddIcon />}>
                Отчет
              </Button>
            </>
          ) : null}
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {organization?.name || 'Организация'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Просмотр данных организации, сотрудников и логистических отчетов.
          </Typography>
        </Box>

        <SectionTabs value={tab} onChange={setTab} />

        {tab === 'overview' ? (
          <Stack spacing={3}>
            <SummaryCards items={summaryCards} />
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">Информация</Typography>
                  <Typography>ИНН: {organization?.inn || '-'}</Typography>
                  <Typography>Регион: {organization?.region || '-'}</Typography>
                  <Typography>Описание: {organization?.description || '-'}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : null}

        {tab === 'members' ? (
          <Card>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Логин</TableCell>
                    <TableCell>ФИО</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Должность</TableCell>
                    <TableCell>Роль</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/organizations/${organizationId}/members/${item.id}`)}
                  >
                      <TableCell>{item.login}</TableCell>
                      <TableCell>{item.fullName}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>
                        <Chip size="small" label={item.role} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {tab === 'reports' ? (
          <Card>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Номер</TableCell>
                    <TableCell>Маршрут</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Срок</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/organizations/${organizationId}/reports/${item.id}`)}
                    >
                      <TableCell>{item.shipmentNumber}</TableCell>
                      <TableCell>
                        {item.routeFrom} → {item.routeTo}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={item.status} color={item.delayed ? 'error' : 'success'} variant="outlined" />
                      </TableCell>
                      <TableCell>{item.transitDays} дн.</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </Stack>
    </AppLayout>
  );
}
