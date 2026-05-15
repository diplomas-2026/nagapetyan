import { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatMoney, formatWeight } from '../utils/formatters';
import { getReportStatusLabel, getRoleLabel } from '../utils/labels';

const ROLE_COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#db2777'];
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

function MiniBarChart({ items, color, valueFormatter = (value) => String(value), labelSuffix = '', maxWidth = 320 }) {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));

  return (
    <Stack spacing={1.25}>
      {items.map((item) => {
        const percentage = Math.max(4, Math.round((Number(item.value || 0) / max) * 100));
        return (
          <Box key={item.name} sx={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) minmax(0, 2fr) auto', gap: 1.25, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {item.name}
            </Typography>
            <Box sx={{ height: 12, borderRadius: 999, bgcolor: 'rgba(15, 23, 42, 0.07)', overflow: 'hidden' }}>
              <Box
                sx={{
                  width: `${percentage}%`,
                  maxWidth: maxWidth,
                  height: '100%',
                  borderRadius: 999,
                  bgcolor: color,
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
              {valueFormatter(item.value)}
              {labelSuffix}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

function TrendSparkline({ data, stroke = '#2563eb', label }) {
  const width = 820;
  const height = 220;
  const paddingX = 24;
  const paddingY = 20;
  const values = data.map((item) => Number(item.value || 0));
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const points = data.map((item, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(1, data.length - 1);
    const normalized = (Number(item.value || 0) - min) / Math.max(1, max - min);
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return `${x},${y}`;
  });

  const area = `M ${paddingX},${height - paddingY} L ${points.join(' L ')} L ${width - paddingX},${height - paddingY} Z`;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: width }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          <defs>
            <linearGradient id={`trend-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={width} height={height} rx="20" fill="#f8fafc" />
          {[0, 1, 2, 3].map((step) => {
            const y = paddingY + ((height - paddingY * 2) / 3) * step;
            return <line key={step} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />;
          })}
          <path d={area} fill={`url(#trend-${stroke.replace('#', '')})`} />
          <polyline fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
          {data.map((item, index) => {
            const x = paddingX + (index * (width - paddingX * 2)) / Math.max(1, data.length - 1);
            const normalized = (Number(item.value || 0) - min) / Math.max(1, max - min);
            const y = height - paddingY - normalized * (height - paddingY * 2);
            return (
              <g key={item.name}>
                <circle cx={x} cy={y} r="5" fill={stroke} />
                <text x={x} y={height - 2} textAnchor="middle" fontSize="12" fill="#64748b">
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}

function RingSummary({ items, colors }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  let cumulative = 0;

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 280px) minmax(0, 1fr)' }, alignItems: 'center' }}>
      <Box
        sx={{
          width: 260,
          height: 260,
          mx: 'auto',
          borderRadius: '50%',
          background: `conic-gradient(${items
            .map((item, index) => {
              const start = cumulative;
              cumulative += (Number(item.value || 0) / total) * 360;
              return `${colors[index % colors.length]} ${start}deg ${cumulative}deg`;
            })
            .join(', ')})`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 40,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.2)',
          },
        }}
      />
      <Stack spacing={1.25}>
        {items.map((item, index) => (
          <Stack key={item.name} direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: colors[index % colors.length] }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {item.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
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
    const topRoutes = groupBy(reports, (item) => `${item.routeFrom || '—'} → ${item.routeTo || '—'}`)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
      topRoutes,
      totalWeight,
      totalCost,
      delayedCount,
    };
  }, [members, reports]);

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
              <RingSummary items={stats.membersByRole} colors={ROLE_COLORS} />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ minWidth: 0 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Статусы отправлений</Typography>
              <RingSummary items={stats.reportsByStatus} colors={STATUS_COLORS} />
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
              <TrendSparkline data={stats.monthly.map((item) => ({ name: item.label, value: item.shipments }))} stroke={TREND_COLORS[0]} label="Динамика отправлений" />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {stats.monthly.map((item) => (
                  <Chip key={item.label} label={`${item.label}: ${item.shipments}`} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ minWidth: 0 }}>
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
              <Typography variant="h6">Топ направлений</Typography>
              <MiniBarChart items={stats.topRoutes} color="#2563eb" valueFormatter={(value) => value} />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Топ получателей</Typography>
              <MiniBarChart items={stats.topDestinations} color="#0f766e" valueFormatter={(value) => value} />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined" sx={{ minWidth: 0 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Комбинированная динамика</Typography>
            <TrendSparkline
              data={stats.monthly.map((item) => ({
                name: item.label,
                value: item.weight,
              }))}
              stroke={TREND_COLORS[1]}
              label="Динамика веса отправлений"
            />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Суммарный вес
                    </Typography>
                    <Typography variant="h6">{formatWeight(stats.totalWeight)}</Typography>
                  </Stack>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Суммарная стоимость
                    </Typography>
                    <Typography variant="h6">{formatMoney(stats.totalCost)}</Typography>
                  </Stack>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Отправлений в анализе
                    </Typography>
                    <Typography variant="h6">{reports.length}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
