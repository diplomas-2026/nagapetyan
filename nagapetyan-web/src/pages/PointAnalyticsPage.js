import { useMemo } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { useOrganizationDetails } from '../hooks/useOrganizationDetails';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getReportStatusLabel } from '../utils/labels';
import { formatCoordinate } from '../utils/points';

function getStatusColor(status, delayed) {
  if (status === 'DELIVERED' && !delayed) {
    return 'success';
  }
  if (status === 'DELAYED' || delayed) {
    return 'warning';
  }
  if (status === 'CANCELED') {
    return 'error';
  }
  return 'info';
}

function countBy(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const key = getter(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function buildCoordinates(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return [latitude, longitude];
}

function normalizeText(value) {
  return String(value || '').trim();
}

export function PointAnalyticsPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const { reports } = useOrganizationDetails(token, organizationId);

  const pointName = searchParams.get('name') || '';
  const pointKind = searchParams.get('kind') || 'from';
  const pointLatitude = searchParams.get('lat');
  const pointLongitude = searchParams.get('lng');
  const center = buildCoordinates(pointLatitude, pointLongitude);

  const pointStats = useMemo(() => {
    const outgoing = reports.filter((item) => normalizeText(item.routeFrom) === normalizeText(pointName));
    const incoming = reports.filter((item) => normalizeText(item.routeTo) === normalizeText(pointName));
    const relatedMap = new Map();
    [...outgoing, ...incoming].forEach((item) => relatedMap.set(item.id, item));
    const related = Array.from(relatedMap.values());
    const delayedCount = related.filter((item) => item.delayed).length;
    const deliveredCount = related.filter((item) => item.status === 'DELIVERED').length;
    const onTimeCount = related.filter((item) => item.deliveredAt && !item.delayed).length;
    const totalWeight = related.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    const totalCost = related.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const outgoingByDestination = countBy(outgoing, (item) => item.routeTo || 'Без маршрута').slice(0, 5);
    const incomingByOrigin = countBy(incoming, (item) => item.routeFrom || 'Без маршрута').slice(0, 5);
    const statusByDirection = {
      outgoing: countBy(outgoing, (item) => getReportStatusLabel(item.status)),
      incoming: countBy(incoming, (item) => getReportStatusLabel(item.status)),
    };

    return {
      outgoing,
      incoming,
      related,
      delayedCount,
      deliveredCount,
      onTimeCount,
      totalWeight,
      totalCost,
      outgoingByDestination,
      incomingByOrigin,
      statusByDirection,
    };
  }, [pointName, reports]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  const kindLabel = pointKind === 'to' ? 'Пункт назначения' : 'Пункт отправки';
  const summaryCards = [
    { label: 'Всего связано', value: pointStats.related.length },
    { label: 'Отправлено отсюда', value: pointStats.outgoing.length },
    { label: 'Прибыло сюда', value: pointStats.incoming.length },
    { label: 'Доставлено', value: pointStats.deliveredCount },
    { label: 'С задержкой', value: pointStats.delayedCount },
    { label: 'Суммарный вес', value: formatWeight(pointStats.totalWeight) },
    { label: 'Суммарная стоимость', value: formatMoney(pointStats.totalCost) },
    { label: 'Вовремя', value: pointStats.onTimeCount },
  ];

  function openReportDetails(reportId) {
    window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={pointName ? `${kindLabel}: ${pointName}` : 'Точка маршрута'}
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
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={kindLabel} color="primary" />
                <Chip label={pointName || 'Без названия'} variant="outlined" />
                <Chip label={`Широта: ${formatCoordinate(pointLatitude)}`} variant="outlined" />
                <Chip label={`Долгота: ${formatCoordinate(pointLongitude)}`} variant="outlined" />
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {pointName || 'Точка маршрута'}
              </Typography>
              <Typography color="text.secondary">
                На этой странице показана карта точки, а также статистика отправлений, которые ушли отсюда и приехали сюда.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Карта точки</Typography>
              {center ? (
                <div style={{ height: 440, width: '100%', borderRadius: 20, overflow: 'hidden' }}>
                  <MapContainer key={`${pointLatitude}-${pointLongitude}`} center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker center={center} radius={12} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.9 }}>
                      <Popup>{pointName}</Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              ) : (
                <Alert severity="info">Для этой точки не указаны координаты. На карте можно отобразить только точку с широтой и долготой.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {summaryCards.map((item) => (
            <Card key={item.label} variant="outlined">
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {item.value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Отправления с этой точки</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер</TableCell>
                      <TableCell>Куда</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pointStats.outgoing.length ? (
                      pointStats.outgoing.slice(0, 8).map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.shipmentNumber}</TableCell>
                          <TableCell>{item.routeTo || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={getReportStatusLabel(item.status)} color={getStatusColor(item.status, item.delayed)} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Button onClick={() => openReportDetails(item.id)} size="small">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Нет отправлений
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Отправления на эту точку</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер</TableCell>
                      <TableCell>Откуда</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pointStats.incoming.length ? (
                      pointStats.incoming.slice(0, 8).map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.shipmentNumber}</TableCell>
                          <TableCell>{item.routeFrom || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={getReportStatusLabel(item.status)} color={getStatusColor(item.status, item.delayed)} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Button onClick={() => openReportDetails(item.id)} size="small">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Нет отправлений
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Частые направления из точки</Typography>
                {pointStats.outgoingByDestination.length ? (
                  pointStats.outgoingByDestination.map((item) => (
                    <Stack key={item.name} spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography>{item.name}</Typography>
                        <Typography color="text.secondary">{item.value}</Typography>
                      </Stack>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${Math.max(8, (item.value / pointStats.outgoing.length) * 100)}%`, background: '#2563eb', borderRadius: 999 }} />
                      </div>
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary">Нет данных</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Частые источники в точку</Typography>
                {pointStats.incomingByOrigin.length ? (
                  pointStats.incomingByOrigin.map((item) => (
                    <Stack key={item.name} spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography>{item.name}</Typography>
                        <Typography color="text.secondary">{item.value}</Typography>
                      </Stack>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${Math.max(8, (item.value / pointStats.incoming.length) * 100)}%`, background: '#0f766e', borderRadius: 999 }} />
                      </div>
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary">Нет данных</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </AppLayout>
  );
}
