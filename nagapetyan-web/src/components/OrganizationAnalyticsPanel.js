import { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getReportStatusLabel, getRoleLabel } from '../utils/labels';

const ROLE_COLORS = ['#0f766e', '#2563eb', '#7c3aed'];
const STATUS_COLORS = ['#16a34a', '#f59e0b', '#dc2626', '#6b7280'];
const TREND_COLORS = ['#2563eb', '#14b8a6', '#f59e0b'];

function monthLabel(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ru-RU', { month: 'short', year: 'numeric' }).format(date);
}

function groupBy(items, keyGetter) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyGetter(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function groupMonthly(reports) {
  const map = new Map();
  reports.forEach((item) => {
    if (!item.shippedAt) {
      return;
    }
    const month = String(item.shippedAt).slice(0, 7);
    const current = map.get(month) || { month, shipments: 0, weight: 0, cost: 0 };
    current.shipments += 1;
    current.weight += Number(item.weight || 0);
    current.cost += Number(item.cost || 0);
    map.set(month, current);
  });
  return Array.from(map.values())
    .sort((a, b) => String(a.month).localeCompare(String(b.month)))
    .map((item) => ({
      ...item,
      label: monthLabel(item.month),
    }));
}

function ChartFrame({ children }) {
  return (
    <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
      <Box sx={{ minWidth: 760 }}>{children}</Box>
    </Box>
  );
}

export function OrganizationAnalyticsPanel({ dashboard, members = [], reports = [] }) {
  const stats = useMemo(() => {
    const owners = members.filter((item) => item.role === 'OWNER').length;
    const employees = members.filter((item) => item.role === 'EMPLOYEE').length;
    const membersByRole = groupBy(members, (item) => getRoleLabel(item.role));
    const reportsByStatus = groupBy(reports, (item) => getReportStatusLabel(item.status));
    const topDestinations = groupBy(reports, (item) => item.routeTo || 'Без маршрута')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const monthly = groupMonthly(reports);
    const totalWeight = reports.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    const totalCost = reports.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const delayedCount = reports.filter((item) => item.delayed).length;

    return {
      owners,
      employees,
      membersByRole,
      reportsByStatus,
      topDestinations,
      monthly,
      totalWeight,
      totalCost,
      delayedCount,
    };
  }, [members, reports]);

  const topRoutes = useMemo(
    () =>
      groupBy(reports, (item) => `${item.routeFrom || '—'} → ${item.routeTo || '—'}`)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [reports],
  );

  const deliveredOnTime = dashboard?.summary?.deliveredOnTime ?? 0;
  const delayed = dashboard?.summary?.delayed ?? stats.delayedCount;
  const totalRecords = dashboard?.summary?.totalRecords ?? reports.length;

  const kpis = [
    { label: 'Отправлений', value: totalRecords },
    { label: 'Сотрудников', value: members.length },
    { label: 'Владельцев', value: stats.owners },
    { label: 'Сотрудников в роли', value: stats.employees },
    { label: 'Вовремя', value: deliveredOnTime },
    { label: 'С задержкой', value: delayed },
    { label: 'Суммарный вес', value: formatWeight(stats.totalWeight) },
    { label: 'Суммарная стоимость', value: formatMoney(stats.totalCost) },
  ];

  const chartWidth = 760;

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #dbeafe 100%)',
          color: '#fff',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ opacity: 0.82, letterSpacing: 1.2 }}>
            Аналитика организации
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            Сводка по ключевым показателям
          </Typography>
          <Typography sx={{ opacity: 0.88, maxWidth: 840 }}>
            Здесь собраны главные показатели по сотрудникам, отправлениям, статусам и динамике за выбранную организацию.
          </Typography>
        </Stack>
      </Box>

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
        {kpis.map((item) => (
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
        <Card variant="outlined" sx={{ minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Сотрудники по ролям</Typography>
              <ChartFrame>
                <PieChart width={chartWidth} height={320}>
                  <Pie data={stats.membersByRole} dataKey="value" nameKey="name" innerRadius={75} outerRadius={120} cx={chartWidth / 2} cy={160} paddingAngle={4}>
                    {stats.membersByRole.map((entry, index) => (
                      <Cell key={entry.name} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartFrame>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.membersByRole.map((item, index) => (
                  <Chip key={item.name} label={`${item.name}: ${item.value}`} sx={{ bgcolor: `${ROLE_COLORS[index % ROLE_COLORS.length]}15`, borderColor: `${ROLE_COLORS[index % ROLE_COLORS.length]}40` }} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Статусы отправлений</Typography>
              <ChartFrame>
                <PieChart width={chartWidth} height={320}>
                  <Pie data={stats.reportsByStatus} dataKey="value" nameKey="name" innerRadius={75} outerRadius={120} cx={chartWidth / 2} cy={160} paddingAngle={4}>
                    {stats.reportsByStatus.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartFrame>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.reportsByStatus.map((item, index) => (
                  <Chip key={item.name} label={`${item.name}: ${item.value}`} sx={{ bgcolor: `${STATUS_COLORS[index % STATUS_COLORS.length]}15`, borderColor: `${STATUS_COLORS[index % STATUS_COLORS.length]}40` }} variant="outlined" />
                ))}
              </Stack>
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
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <Card variant="outlined" sx={{ gridColumn: { lg: 'span 2' }, minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Динамика отправлений по месяцам</Typography>
              <ChartFrame>
                <LineChart data={stats.monthly} width={chartWidth} height={320}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="shipments" stroke={TREND_COLORS[0]} strokeWidth={3} dot={{ r: 3 }} name="Отправления" />
                  <Line type="monotone" dataKey="weight" stroke={TREND_COLORS[1]} strokeWidth={3} dot={{ r: 3 }} name="Вес, кг" />
                  <Line type="monotone" dataKey="cost" stroke={TREND_COLORS[2]} strokeWidth={3} dot={{ r: 3 }} name="Стоимость, руб." />
                </LineChart>
              </ChartFrame>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Топ направлений</Typography>
              <ChartFrame>
                <BarChart data={topRoutes} layout="vertical" width={chartWidth} height={320}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartFrame>
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
        <Card variant="outlined" sx={{ minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Топ получателей</Typography>
              <ChartFrame>
                <BarChart data={stats.topDestinations} width={chartWidth} height={280}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartFrame>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Показатели в цифрах</Typography>
              <Stack spacing={1.25}>
                <Typography>Вовремя доставлено: {dashboard?.summary?.deliveredOnTime ?? 0}</Typography>
                <Typography>С задержкой: {dashboard?.summary?.delayed ?? 0}</Typography>
                <Typography>Процент вовремя: {dashboard?.summary?.onTimePercent?.toFixed?.(1) ?? 0}%</Typography>
                <Typography>Средний срок доставки: {dashboard?.summary?.averageTransitDays?.toFixed?.(1) ?? 0} дн.</Typography>
                <Typography>Всего отправлений: {dashboard?.summary?.totalRecords ?? reports.length}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined" sx={{ minWidth: 0 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Комбинированная динамика</Typography>
            <ChartFrame>
              <AreaChart data={stats.monthly} width={chartWidth} height={320}>
                <defs>
                  <linearGradient id="shipmentsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="shipments" stroke="#2563eb" fillOpacity={1} fill="url(#shipmentsColor)" name="Отправления" />
                <Area type="monotone" dataKey="weight" stroke="#14b8a6" fillOpacity={1} fill="url(#weightColor)" name="Вес, кг" />
              </AreaChart>
            </ChartFrame>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
