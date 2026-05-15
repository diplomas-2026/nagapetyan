import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

function buildHeatmap(monthly, reports) {
  const months = monthly.map((item) => item.month);
  const statuses = ['IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELED'];
  const grid = new Map();

  reports.forEach((item) => {
    if (!item.shippedAt) {
      return;
    }
    const month = String(item.shippedAt).slice(0, 7);
    const key = `${month}:${item.status || 'IN_TRANSIT'}`;
    grid.set(key, (grid.get(key) || 0) + 1);
  });

  const data = [];
  months.forEach((month, xIndex) => {
    statuses.forEach((status, yIndex) => {
      data.push([xIndex, yIndex, grid.get(`${month}:${status}`) || 0]);
    });
  });

  return {
    months: months.map(monthLabel),
    statuses: statuses.map(getReportStatusLabel),
    data,
  };
}

function ChartCard({ title, subtitle, children, height = 340 }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 0, height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
          <Box sx={{ width: '100%', height, minWidth: 0 }}>{children}</Box>
        </Stack>
      </CardContent>
    </Card>
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
      .slice(0, 8);
    const monthly = groupMonthly(reports);
    const topRoutes = groupBy(reports, (item) => `${item.routeFrom || '—'} → ${item.routeTo || '—'}`)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const totalWeight = reports.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    const totalCost = reports.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const delayedCount = reports.filter((item) => item.delayed).length;
    const onTimePercent = dashboard?.summary?.onTimePercent ?? 0;
    const delayedPercent = reports.length ? (delayedCount / reports.length) * 100 : 0;
    const speedScore = Math.max(0, 100 - (dashboard?.summary?.averageTransitDays ?? 0) * 12);
    const volumeScore = Math.min(100, reports.length * 8);
    const weightScore = Math.min(100, totalWeight / 5);

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
      onTimePercent,
      delayedPercent,
      speedScore,
      volumeScore,
      weightScore,
    };
  }, [dashboard, members, reports]);

  const deliveredOnTime = dashboard?.summary?.deliveredOnTime ?? 0;
  const delayed = dashboard?.summary?.delayed ?? stats.delayedCount;
  const totalRecords = dashboard?.summary?.totalRecords ?? reports.length;
  const heatmap = useMemo(() => buildHeatmap(stats.monthly, reports), [reports, stats.monthly]);

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

  const gaugeOption = {
    tooltip: { formatter: '{a}: {c}%' },
    series: [
      {
        name: 'Показатель',
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        progress: { show: true, width: 16 },
        axisLine: { lineStyle: { width: 16, color: [[0.6, '#f59e0b'], [0.85, '#22c55e'], [1, '#2563eb']] } },
        pointer: { show: true, length: '60%' },
        detail: { valueAnimation: true, formatter: '{value}%', fontSize: 22, offsetCenter: [0, '68%'] },
        data: [{ value: Number(stats.onTimePercent.toFixed(1)), name: 'Вовремя' }],
      },
    ],
  };

  const rolesOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: stats.membersByRole.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: ROLE_COLORS[index % ROLE_COLORS.length] },
        })),
      },
    ],
  };

  const statusesOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: stats.reportsByStatus.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: STATUS_COLORS[index % STATUS_COLORS.length] },
        })),
      },
    ],
  };

  const monthlyOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 24, top: 10, bottom: 55 },
    xAxis: { type: 'category', data: stats.monthly.map((item) => item.label) },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Отправления',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.18 },
        lineStyle: { width: 3, color: TREND_COLORS[0] },
        itemStyle: { color: TREND_COLORS[0] },
        data: stats.monthly.map((item) => item.shipments),
      },
      {
        name: 'Вес, кг',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.12 },
        lineStyle: { width: 3, color: TREND_COLORS[1] },
        itemStyle: { color: TREND_COLORS[1] },
        data: stats.monthly.map((item) => item.weight),
      },
    ],
  };

  const topRoutesOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 30, right: 24, top: 10, bottom: 20, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: stats.topRoutes.map((item) => item.name) },
    series: [
      {
        type: 'bar',
        data: stats.topRoutes.map((item) => item.value),
        barWidth: 18,
        itemStyle: { color: '#2563eb', borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  const destinationsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 30, right: 24, top: 10, bottom: 20, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: stats.topDestinations.map((item) => item.name) },
    series: [
      {
        type: 'bar',
        data: stats.topDestinations.map((item) => item.value),
        barWidth: 18,
        itemStyle: { color: '#0f766e', borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  const scatterOption = {
    tooltip: {
      formatter: (params) => {
        const item = reports[params.dataIndex];
        return [
          item?.shipmentNumber || '-',
          `Вес: ${formatWeight(item?.weight)}`,
          `Стоимость: ${formatMoney(item?.cost)}`,
          `Статус: ${getReportStatusLabel(item?.status)}`,
        ].join('<br/>');
      },
    },
    grid: { left: 35, right: 18, top: 10, bottom: 40 },
    xAxis: { type: 'value', name: 'Стоимость' },
    yAxis: { type: 'value', name: 'Вес' },
    series: [
      {
        type: 'scatter',
        symbolSize: (value) => Math.max(8, Math.min(30, Number(value[1] || 0) * 3 + 6)),
        itemStyle: {
          color: (params) => {
            const item = reports[params.dataIndex];
            if (item?.status === 'DELIVERED') return '#16a34a';
            if (item?.status === 'DELAYED') return '#f59e0b';
            if (item?.status === 'CANCELED') return '#dc2626';
            return '#2563eb';
          },
        },
        data: reports.slice(0, 40).map((item) => [Number(item.cost || 0), Number(item.weight || 0)]),
      },
    ],
  };

  const funnelOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'funnel',
        left: '5%',
        top: 10,
        bottom: 10,
        width: '90%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 4,
        label: { show: true, position: 'inside' },
        data: stats.reportsByStatus.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: STATUS_COLORS[index % STATUS_COLORS.length] },
        })),
      },
    ],
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: 'Вовремя', max: 100 },
        { name: 'Скорость', max: 100 },
        { name: 'Объем', max: 100 },
        { name: 'Вес', max: 100 },
        { name: 'Задержки', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 3, color: '#2563eb' },
        itemStyle: { color: '#2563eb' },
        data: [
          {
            value: [stats.onTimePercent, stats.speedScore, stats.volumeScore, stats.weightScore, Math.max(0, 100 - stats.delayedPercent)],
            name: 'Показатели',
          },
        ],
      },
    ],
  };

  const heatmapOption = {
    tooltip: {
      position: 'top',
    },
    grid: { height: '72%', top: '12%', left: 90, right: 24, bottom: 45 },
    xAxis: {
      type: 'category',
      data: heatmap.months,
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: heatmap.statuses,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(1, ...heatmap.data.map((item) => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
    },
    series: [
      {
        name: 'Загрузка',
        type: 'heatmap',
        data: heatmap.data,
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.25)' } },
      },
    ],
  };

  const treemapOption = {
    tooltip: {
      formatter: (params) => `${params.name}<br/>Отправлений: ${params.value}`,
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: { show: true, formatter: '{b}' },
        data: stats.topDestinations.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: ROLE_COLORS[index % ROLE_COLORS.length] },
        })),
      },
    ],
  };

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
        <ChartCard title="Вовремя доставлено" subtitle="Индикатор доли доставок в срок" height={260}>
          <ReactECharts option={gaugeOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Сотрудники по ролям" subtitle="Круговая диаграмма распределения ролей" height={320}>
          <ReactECharts option={rolesOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Статусы отправлений" subtitle="Круговая диаграмма по статусам" height={320}>
          <ReactECharts option={statusesOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Funnel статусов" subtitle="Воронка по стадиям обработки" height={320}>
          <ReactECharts option={funnelOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>
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
        <ChartCard title="Динамика отправлений по месяцам" subtitle="Линейный график с областью" height={320}>
          <ReactECharts option={monthlyOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Radar KPI" subtitle="Сводный радар по ключевым показателям" height={320}>
          <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>
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
        <ChartCard title="Топ направлений" subtitle="Горизонтальная диаграмма" height={320}>
          <ReactECharts option={topRoutesOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Топ получателей" subtitle="Горизонтальная диаграмма" height={320}>
          <ReactECharts option={destinationsOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>
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
        <ChartCard title="Scatter: вес к стоимости" subtitle="Точечная диаграмма по отправлениям" height={320}>
          <ReactECharts option={scatterOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>

        <ChartCard title="Heatmap по месяцам и статусам" subtitle="Плотность отправлений по периодам" height={320}>
          <ReactECharts option={heatmapOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
        </ChartCard>
      </Box>

      <ChartCard title="Treemap по популярным направлениям" subtitle="Плоская карта плотности направлений" height={360}>
        <ReactECharts option={treemapOption} style={{ height: '100%', width: '100%' }} notMerge lazyUpdate opts={{ renderer: 'svg' }} />
      </ChartCard>

      <ChartCard title="Комбинированная динамика" subtitle="Линия по весу и стоимости" height={320}>
        <ReactECharts
          option={{
            tooltip: { trigger: 'axis' },
            legend: { bottom: 0 },
            grid: { left: 40, right: 24, top: 10, bottom: 55 },
            xAxis: { type: 'category', data: stats.monthly.map((item) => item.label) },
            yAxis: { type: 'value' },
            series: [
              {
                name: 'Вес, кг',
                type: 'line',
                smooth: true,
                lineStyle: { width: 3, color: TREND_COLORS[1] },
                itemStyle: { color: TREND_COLORS[1] },
                data: stats.monthly.map((item) => item.weight),
              },
              {
                name: 'Стоимость, руб.',
                type: 'line',
                smooth: true,
                lineStyle: { width: 3, color: TREND_COLORS[2] },
                itemStyle: { color: TREND_COLORS[2] },
                data: stats.monthly.map((item) => item.cost),
              },
            ],
          }}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
          opts={{ renderer: 'svg' }}
        />
      </ChartCard>
    </Stack>
  );
}
