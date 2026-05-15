import { Box, Chip, Stack, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

function buildNode(item, category, color) {
  return {
    id: item.id,
    name: item.name,
    value: item.count,
    category,
    symbolSize: Math.min(80, 32 + item.count * 4),
    itemStyle: {
      color,
      borderColor: '#ffffff',
      borderWidth: 2,
      shadowBlur: 18,
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

export function OrganizationRouteGraph({ organizationName, leftNodes = [], rightNodes = [], onNodeClick }) {
  const nodes = [
    {
      id: 'center',
      name: organizationName || 'Организация',
      value: leftNodes.length + rightNodes.length,
      category: 0,
      symbolSize: 110,
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
        formatter: '{b}',
      },
    },
    ...leftNodes.map((item) => buildNode(item, 1, '#0f766e')),
    ...rightNodes.map((item) => buildNode(item, 2, '#2563eb')),
  ];

  const links = [
    ...leftNodes.map((item) => ({
      source: 'center',
      target: item.id,
      lineStyle: {
        color: '#0f766e',
        width: 2,
        curveness: 0.18,
      },
    })),
    ...rightNodes.map((item) => ({
      source: 'center',
      target: item.id,
      lineStyle: {
        color: '#2563eb',
        width: 2,
        curveness: -0.18,
      },
    })),
  ];

  const option = {
    backgroundColor: 'transparent',
    animationDurationUpdate: 400,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.data?.id === 'center') {
          return `${organizationName || 'Организация'}<br/>Точек маршрута: ${nodes.length - 1}`;
        }
        const direction = params.data?.category === 1 ? 'Откуда' : 'Куда';
        return `${direction}: ${params.data?.name}<br/>Связей: ${params.data?.value}`;
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        categories: [
          { name: 'Центр' },
          { name: 'Отправки' },
          { name: 'Назначения' },
        ],
        data: nodes,
        links,
        force: {
          repulsion: 320,
          edgeLength: 180,
          gravity: 0.08,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
        label: {
          show: true,
        },
        lineStyle: {
          opacity: 0.9,
        },
      },
    ],
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Центр" size="small" sx={{ bgcolor: '#e2e8f0' }} />
        <Chip label="Откуда" size="small" sx={{ bgcolor: '#ecfeff', color: '#0f766e' }} />
        <Chip label="Куда" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb' }} />
      </Box>
      <Box sx={{ width: '100%', height: 460, borderRadius: 4, overflow: 'hidden', bgcolor: '#f8fbff' }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          onEvents={{
            click: (params) => {
              if (params.data?.id && params.data.id !== 'center') {
                const clicked = [...leftNodes, ...rightNodes].find((item) => item.id === params.data.id);
                if (clicked) {
                  onNodeClick(clicked);
                }
              }
            },
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Граф можно двигать и масштабировать. Нажми на любой узел, чтобы открыть карточку точки маршрута.
      </Typography>
    </Stack>
  );
}
