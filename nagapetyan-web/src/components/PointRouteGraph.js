import { Box, Chip, Stack, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

function buildNode(item, category, color) {
  return {
    id: item.id,
    name: item.name,
    value: item.value,
    category,
    symbolSize: Math.min(72, 28 + item.value * 4),
    itemStyle: {
      color,
      borderColor: '#ffffff',
      borderWidth: 2,
      shadowBlur: 14,
      shadowColor: 'rgba(15, 23, 42, 0.12)',
    },
    label: {
      show: true,
      position: 'bottom',
      color: '#0f172a',
      fontWeight: 600,
      formatter: '{b}',
    },
  };
}

export function PointRouteGraph({ centerPoint, incoming = [], outgoing = [], onNodeClick }) {
  const nodes = [
    {
      id: 'center',
      name: centerPoint?.name || 'Точка',
      value: incoming.length + outgoing.length,
      category: 0,
      symbolSize: 106,
      fixed: true,
      x: 480,
      y: 220,
      itemStyle: {
        color: '#0f172a',
        borderColor: '#93c5fd',
        borderWidth: 3,
      },
      label: {
        color: '#0f172a',
        fontWeight: 800,
        fontSize: 14,
      },
    },
    ...incoming.map((item) => buildNode(item, 1, '#0f766e')),
    ...outgoing.map((item) => buildNode(item, 2, '#2563eb')),
  ];

  const links = [
    ...incoming.map((item) => ({
      source: item.id,
      target: 'center',
      lineStyle: { color: '#0f766e', width: 2 },
    })),
    ...outgoing.map((item) => ({
      source: 'center',
      target: item.id,
      lineStyle: { color: '#2563eb', width: 2 },
    })),
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.data?.id === 'center') {
          return `${centerPoint?.name || 'Точка'}<br/>Связей: ${incoming.length + outgoing.length}`;
        }
        const direction = params.data?.category === 1 ? 'Прибыло сюда' : 'Отправлено отсюда';
        return `${direction}<br/>${params.data?.name}<br/>Связей: ${params.data?.value}`;
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        data: nodes,
        links,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
        force: {
          repulsion: 280,
          edgeLength: 160,
          gravity: 0.08,
        },
        categories: [
          { name: 'Центр' },
          { name: 'Прибытие' },
          { name: 'Отправка' },
        ],
      },
    ],
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Центр" size="small" sx={{ bgcolor: '#e2e8f0' }} />
        <Chip label="Прибыло сюда" size="small" sx={{ bgcolor: '#ecfeff', color: '#0f766e' }} />
        <Chip label="Отправлено отсюда" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb' }} />
      </Box>
      <Box sx={{ width: '100%', height: 460, borderRadius: 4, overflow: 'hidden', bgcolor: '#f8fbff' }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          onEvents={{
            click: (params) => {
              if (params.data?.id && params.data.id !== 'center') {
                const clicked = [...incoming, ...outgoing].find((item) => item.id === params.data.id);
                if (clicked) {
                  onNodeClick(clicked);
                }
              }
            },
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Граф интерактивный: узлы можно двигать, а по клику открывается карточка точки маршрута.
      </Typography>
    </Stack>
  );
}
