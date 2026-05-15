import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { MovementTimeline } from '../components/MovementTimeline';
import { ShipmentRouteGraph } from '../components/ShipmentRouteGraph';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getMovementTypeLabel, getReportStatusLabel } from '../utils/labels';
import { buildPointUrl, formatCoordinate } from '../utils/points';

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
  const canManageMovements = user?.role !== 'EMPLOYEE';

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

  useEffect(() => {
    api.getReport(token, organizationId, reportId).then(setReport).catch((error) => setMessage(error.message));
  }, [organizationId, reportId, token]);

  const statusTone = useMemo(() => getStatusTone(report), [report]);
  const routeLabel = `${report?.routeFrom || '-'} → ${report?.routeTo || '-'}`;
  function openPoint(url) {
    window.location.assign(url);
  }

  async function handleDeleteMovement(movementId) {
    if (!window.confirm('Удалить этап передвижения?')) {
      return;
    }

    try {
      await api.deleteMovement(token, organizationId, reportId, movementId);
      window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const infoCards = useMemo(
    () => [
      { label: 'Номер', value: report?.shipmentNumber || '-' },
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
        <Button component={Link} to={`/organizations/${organizationId}/reports/${reportId}/edit`} reloadDocument variant="contained" startIcon={<EditIcon />}>
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
            <Stack spacing={2}>
              <Typography variant="h6">Граф маршрута</Typography>
              <Typography color="text.secondary">
                Отправление показано как связь между двумя точками. Нажми на узел, чтобы открыть карточку точки и её аналитику.
              </Typography>
              <ShipmentRouteGraph
                fromPoint={{
                  name: report?.routeFrom,
                  latitude: report?.routeFromLatitude,
                  longitude: report?.routeFromLongitude,
                }}
                toPoint={{
                  name: report?.routeTo,
                  latitude: report?.routeToLatitude,
                  longitude: report?.routeToLongitude,
                }}
                onFromClick={() =>
                  openPoint(
                    buildPointUrl(organizationId, {
                      kind: 'from',
                      name: report?.routeFrom,
                      latitude: report?.routeFromLatitude,
                      longitude: report?.routeFromLongitude,
                    }),
                  )
                }
                onToClick={() =>
                  openPoint(
                    buildPointUrl(organizationId, {
                      kind: 'to',
                      name: report?.routeTo,
                      latitude: report?.routeToLatitude,
                      longitude: report?.routeToLongitude,
                    }),
                  )
                }
              />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Маршрут</Typography>
              <Typography color="text.secondary">{routeLabel}</Typography>
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
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Пункт отправки
                      </Typography>
                      <Button
                        onClick={() =>
                          openPoint(
                            buildPointUrl(organizationId, {
                              kind: 'from',
                              name: report?.routeFrom,
                              latitude: report?.routeFromLatitude,
                              longitude: report?.routeFromLongitude,
                            }),
                          )
                        }
                        variant="text"
                        sx={{ alignSelf: 'flex-start', px: 0, minWidth: 0 }}
                        disabled={!report?.routeFrom}
                      >
                        {report?.routeFrom || '-'}
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {formatCoordinate(report?.routeFromLatitude)}, {formatCoordinate(report?.routeFromLongitude)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Пункт назначения
                      </Typography>
                      <Button
                        onClick={() =>
                          openPoint(
                            buildPointUrl(organizationId, {
                              kind: 'to',
                              name: report?.routeTo,
                              latitude: report?.routeToLatitude,
                              longitude: report?.routeToLongitude,
                            }),
                          )
                        }
                        variant="text"
                        sx={{ alignSelf: 'flex-start', px: 0, minWidth: 0 }}
                        disabled={!report?.routeTo}
                      >
                        {report?.routeTo || '-'}
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {formatCoordinate(report?.routeToLatitude)}, {formatCoordinate(report?.routeToLongitude)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </CardContent>
        </Card>

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
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Этапы передвижения</Typography>
                  <Typography color="text.secondary">Управление историей движения отправления.</Typography>
                </Stack>
                {canManageMovements ? (
                  <Button
                    component={Link}
                    to={`/organizations/${organizationId}/reports/${reportId}/movements/new`}
                    reloadDocument
                    variant="contained"
                    startIcon={<AddIcon />}
                  >
                    Добавить этап
                  </Button>
                ) : null}
              </Stack>

              {report?.movements?.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={88}>№</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Заголовок</TableCell>
                      <TableCell>Локация</TableCell>
                      <TableCell width={130}>Дата</TableCell>
                      {canManageMovements ? <TableCell align="right">Действия</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.movements.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.sortOrder}</TableCell>
                        <TableCell>{getMovementTypeLabel(item.movementType)}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{item.eventDate || '-'}</TableCell>
                        {canManageMovements ? (
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                component={Link}
                                to={`/organizations/${organizationId}/reports/${reportId}/movements/${item.id}/edit`}
                                reloadDocument
                                size="small"
                                variant="outlined"
                              >
                                Изменить
                              </Button>
                              <Button
                                onClick={() => handleDeleteMovement(item.id)}
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                              >
                                Удалить
                              </Button>
                            </Stack>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="text.secondary">Пока не добавлено ни одного этапа движения.</Typography>
              )}
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
