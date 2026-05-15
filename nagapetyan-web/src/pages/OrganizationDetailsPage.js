import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { OrganizationAnalyticsPanel } from '../components/OrganizationAnalyticsPanel';
import { OrganizationRouteGraph } from '../components/OrganizationRouteGraph';
import { ActionHistoryList } from '../components/ActionHistoryList';
import { ListToolbar } from '../components/ListToolbar';
import { SectionTabs } from '../components/SectionTabs';
import { SummaryCards } from '../components/SummaryCards';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { useOrganizationDetails } from '../hooks/useOrganizationDetails';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getReportStatusLabel, getRoleLabel } from '../utils/labels';
import { matchesSearch } from '../utils/listFilters';
import { buildPointUrl } from '../utils/points';

function normalizeText(value) {
  return String(value || '').trim();
}

export function OrganizationDetailsPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const { organization, dashboard, members, reports, reload } = useOrganizationDetails(token, organizationId);
  const [tab, setTab] = useState('overview');
  const [message, setMessage] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyMessage, setHistoryMessage] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [memberSort, setMemberSort] = useState('name-asc');
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportSort, setReportSort] = useState('date-desc');
  const currentMember = members.find((item) => String(item.login) === String(user?.login || ''));
  const isLogisticsLeader = currentMember?.position === 'Руководитель логистики' || user?.position === 'Руководитель логистики';

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
  }, [organizationId, setOrganizationId]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  function handleTabChange(nextTab) {
    setTab(nextTab);
  }

  function openReportDetails(reportId) {
    window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
  }

  function openMemberDetails(memberId) {
    window.location.assign(`/organizations/${organizationId}/members/${memberId}`);
  }

  async function loadHistory() {
    if (!token || !organizationId || !isLogisticsLeader || !user?.login) {
      setHistoryItems([]);
      return;
    }

    try {
      const items = await api.getActionHistory(token, organizationId, user.login);
      setHistoryItems(Array.isArray(items) ? items : []);
    } catch (error) {
      setHistoryItems([]);
      setHistoryMessage(error.message);
    }
  }

  async function handleExportReports(format) {
    try {
      setExportingFormat(format);
      const exportFile = await api.exportReports(token, organizationId, format);
      const url = window.URL.createObjectURL(exportFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportFile.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setExportingFormat(null);
    }
  }

  useEffect(() => {
    if (!isLogisticsLeader && tab === 'history') {
      setTab('overview');
    }
  }, [isLogisticsLeader, tab]);

  useEffect(() => {
    if (tab === 'history') {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token, organizationId, isLogisticsLeader, user?.login]);

  const memberFiltered = useMemo(
    () =>
      members
        .filter((item) => (memberRoleFilter === 'all' ? true : item.role === memberRoleFilter))
        .filter((item) => matchesSearch([item.login, item.fullName, item.email, item.position], memberSearch))
        .sort((a, b) => {
          switch (memberSort) {
            case 'name-desc':
              return String(b.fullName || '').localeCompare(String(a.fullName || ''), 'ru');
            case 'login-asc':
              return String(a.login || '').localeCompare(String(b.login || ''), 'ru');
            case 'login-desc':
              return String(b.login || '').localeCompare(String(a.login || ''), 'ru');
            case 'role-asc':
              return String(a.role || '').localeCompare(String(b.role || ''), 'ru');
            case 'role-desc':
              return String(b.role || '').localeCompare(String(a.role || ''), 'ru');
            case 'name-asc':
            default:
              return String(a.fullName || '').localeCompare(String(b.fullName || ''), 'ru');
          }
        }),
    [memberRoleFilter, memberSearch, memberSort, members],
  );

  const reportFiltered = useMemo(
    () =>
      reports
        .filter((item) => (reportStatusFilter === 'all' ? true : item.status === reportStatusFilter))
        .filter((item) => matchesSearch([item.shipmentNumber, item.routeFrom, item.routeTo, item.note, item.responsibleDepartment], reportSearch))
        .sort((a, b) => {
          switch (reportSort) {
            case 'date-asc':
              return String(a.shippedAt || '').localeCompare(String(b.shippedAt || ''), 'ru');
            case 'weight-asc':
              return Number(a.weight || 0) - Number(b.weight || 0);
            case 'weight-desc':
              return Number(b.weight || 0) - Number(a.weight || 0);
            case 'cost-asc':
              return Number(a.cost || 0) - Number(b.cost || 0);
            case 'cost-desc':
              return Number(b.cost || 0) - Number(a.cost || 0);
            case 'date-desc':
            default:
              return String(b.shippedAt || '').localeCompare(String(a.shippedAt || ''), 'ru');
          }
        }),
    [reportSearch, reportSort, reportStatusFilter, reports],
  );

  const routeGraphData = useMemo(() => {
    const pointMap = new Map();
    const linkMap = new Map();

    reports.forEach((item) => {
      const fromName = normalizeText(item.routeFrom);
      const toName = normalizeText(item.routeTo);

      if (fromName) {
        const current = pointMap.get(fromName) || { id: `point-${fromName}`, name: item.routeFrom, count: 0, outgoingCount: 0, incomingCount: 0, latitude: item.routeFromLatitude, longitude: item.routeFromLongitude };
        current.count += 1;
        current.outgoingCount += 1;
        if (current.latitude === null || current.latitude === undefined) {
          current.latitude = item.routeFromLatitude;
        }
        if (current.longitude === null || current.longitude === undefined) {
          current.longitude = item.routeFromLongitude;
        }
        pointMap.set(fromName, current);
      }

      if (toName) {
        const current = pointMap.get(toName) || { id: `point-${toName}`, name: item.routeTo, count: 0, outgoingCount: 0, incomingCount: 0, latitude: item.routeToLatitude, longitude: item.routeToLongitude };
        current.count += 1;
        current.incomingCount += 1;
        if (current.latitude === null || current.latitude === undefined) {
          current.latitude = item.routeToLatitude;
        }
        if (current.longitude === null || current.longitude === undefined) {
          current.longitude = item.routeToLongitude;
        }
        pointMap.set(toName, current);
      }

      if (fromName && toName) {
        const key = `${fromName} -> ${toName}`;
        const link = linkMap.get(key) || { source: fromName, target: toName, count: 0 };
        link.count += 1;
        linkMap.set(key, link);
      }
    });

    const points = Array.from(pointMap.values())
      .map((item) => ({
        ...item,
        kind: item.outgoingCount >= item.incomingCount ? 'from' : 'to',
        color: item.outgoingCount >= item.incomingCount ? '#0f766e' : '#2563eb',
      }))
      .sort((a, b) => b.count - a.count || String(a.name).localeCompare(String(b.name), 'ru'))
      .slice(0, 24);

    return {
      points,
      links: Array.from(linkMap.values()).map((item) => ({
        ...item,
        color: '#2563eb',
      })),
    };
  }, [reports]);

  function openPointNode(point) {
    window.location.assign(
      buildPointUrl(organizationId, {
        kind: point.kind,
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
      }),
    );
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
            <Button component={Link} to={`/organizations/${organizationId}/edit`} reloadDocument variant="outlined" startIcon={<EditIcon />}>
              Редактировать
            </Button>
          ) : null}
          {user?.role !== 'EMPLOYEE' ? (
            <>
              <Button component={Link} to={`/organizations/${organizationId}/members/new?role=OWNER`} reloadDocument variant="outlined" startIcon={<AddIcon />}>
                Владелец
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/members/new?role=EMPLOYEE`} reloadDocument variant="outlined" startIcon={<AddIcon />}>
                Сотрудник
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/reports/import`} reloadDocument variant="outlined" startIcon={<UploadFileIcon />}>
                Загрузить отчет
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/reports/new`} reloadDocument variant="contained" startIcon={<AddIcon />}>
                Отправление
              </Button>
            </>
          ) : null}
          <Button
            onClick={() => handleExportReports('xlsx')}
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={exportingFormat !== null}
          >
            Excel
          </Button>
          <Button
            onClick={() => handleExportReports('pdf')}
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={exportingFormat !== null}
          >
            PDF
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {organization?.name || 'Организация'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Просмотр данных организации, сотрудников и отправлений.
          </Typography>
        </Box>

        <SectionTabs value={tab} onChange={handleTabChange} showHistory={isLogisticsLeader} />

        {tab === 'overview' ? (
          <Stack spacing={3}>
            <SummaryCards items={summaryCards} />
            <Card variant="outlined">
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

        {tab === 'graph' ? (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Карта маршрутов</Typography>
                <Typography color="text.secondary">
                  Здесь показаны наиболее частые пункты отправки и назначения этой организации. Нажимай на точки, чтобы открыть их аналитику.
                </Typography>
                <OrganizationRouteGraph points={routeGraphData.points} links={routeGraphData.links} onNodeClick={openPointNode} />
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {tab === 'analytics' ? <OrganizationAnalyticsPanel dashboard={dashboard} members={members} reports={reports} /> : null}

        {tab === 'members' ? (
          <Card>
            <CardContent>
              <ListToolbar
                searchLabel="Поиск по сотрудникам"
                searchValue={memberSearch}
                onSearchChange={setMemberSearch}
                sortLabel="Сортировка"
                sortValue={memberSort}
                onSortChange={setMemberSort}
                sortOptions={[
                  { value: 'name-asc', label: 'ФИО: по возрастанию' },
                  { value: 'name-desc', label: 'ФИО: по убыванию' },
                  { value: 'login-asc', label: 'Логин: по возрастанию' },
                  { value: 'login-desc', label: 'Логин: по убыванию' },
                  { value: 'role-asc', label: 'Роль: по возрастанию' },
                  { value: 'role-desc', label: 'Роль: по убыванию' },
                ]}
                filterLabel="Роль"
                filterValue={memberRoleFilter}
                onFilterChange={setMemberRoleFilter}
                filterOptions={[
                  { value: 'all', label: 'Все роли' },
                  { value: 'OWNER', label: getRoleLabel('OWNER') },
                  { value: 'EMPLOYEE', label: getRoleLabel('EMPLOYEE') },
                ]}
              />
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
                  {memberFiltered.length ? (
                    memberFiltered.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => openMemberDetails(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openMemberDetails(item.id);
                          }
                        }}
                      >
                        <TableCell>{item.login}</TableCell>
                        <TableCell>{item.fullName}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.position}</TableCell>
                        <TableCell>
                          <Chip size="small" label={getRoleLabel(item.role)} variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {tab === 'reports' ? (
          <Card>
            <CardContent>
              <ListToolbar
                searchLabel="Поиск по отправлениям"
                searchValue={reportSearch}
                onSearchChange={setReportSearch}
                sortLabel="Сортировка"
                sortValue={reportSort}
                onSortChange={setReportSort}
                sortOptions={[
                  { value: 'date-desc', label: 'Дата отправки: сначала новые' },
                  { value: 'date-asc', label: 'Дата отправки: сначала старые' },
                  { value: 'weight-desc', label: 'Вес: по убыванию' },
                  { value: 'weight-asc', label: 'Вес: по возрастанию' },
                  { value: 'cost-desc', label: 'Стоимость: по убыванию' },
                  { value: 'cost-asc', label: 'Стоимость: по возрастанию' },
                ]}
                filterLabel="Статус"
                filterValue={reportStatusFilter}
                onFilterChange={setReportStatusFilter}
                filterOptions={[
                  { value: 'all', label: 'Все статусы' },
                  { value: 'IN_TRANSIT', label: 'В пути' },
                  { value: 'DELIVERED', label: 'Доставлено' },
                  { value: 'DELAYED', label: 'С задержкой' },
                  { value: 'CANCELED', label: 'Отменено' },
                ]}
              />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Номер отправления</TableCell>
                    <TableCell>Маршрут</TableCell>
                    <TableCell>Вес</TableCell>
                    <TableCell>Стоимость</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Срок</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportFiltered.length ? (
                    reportFiltered.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => openReportDetails(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openReportDetails(item.id);
                          }
                        }}
                      >
                        <TableCell>{item.shipmentNumber}</TableCell>
                        <TableCell>
                          {item.routeFrom} → {item.routeTo}
                        </TableCell>
                        <TableCell>{formatWeight(item.weight)}</TableCell>
                        <TableCell>{formatMoney(item.cost)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getReportStatusLabel(item.status)}
                            color={item.delayed ? 'error' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.transitDays} дн.</TableCell>
                        <TableCell align="right">
                          <Button component={Link} to={`/organizations/${organizationId}/reports/${item.id}`} reloadDocument size="small">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {tab === 'history' && isLogisticsLeader ? (
          <Card>
            <CardContent>
              <ActionHistoryList
                items={historyItems}
                organizationId={organizationId}
                currentUserRole={user?.role}
                onRevert={async (historyId) => {
                  try {
                    await api.revertActionHistory(token, organizationId, historyId);
                    await Promise.all([reload(), loadHistory()]);
                  } catch (error) {
                    setHistoryMessage(error.message);
                    return;
                  }
                  setHistoryMessage('Действие откатили');
                }}
              />
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
      <Snackbar open={Boolean(historyMessage)} autoHideDuration={4000} onClose={() => setHistoryMessage(null)} message={historyMessage || ''} />
    </AppLayout>
  );
}
