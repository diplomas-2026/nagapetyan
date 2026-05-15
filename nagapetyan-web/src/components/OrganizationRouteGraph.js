import { Box, Chip, Stack, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

function buildNode(point) {
  return {
    id: point.id,
    name: point.name,
    value: point.count,
    symbolSize: Math.min(72, 28 + point.count * 3),
    itemStyle: {
      color: point.color,
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

export function OrganizationRouteGraph({ points = [], links = [], onNodeClick }) {
  const option = {
    backgroundColor: 'transparent',
    animationDurationUpdate: 400,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}`;
        }
        return `${params.data?.name || '-'}<br/>Маршрутов: ${params.data?.value || 0}`;
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        data: points.map(buildNode),
        links: links.map((item) => ({
          source: item.source,
          target: item.target,
          lineStyle: {
            color: item.color || '#2563eb',
            width: 2,
            curveness: 0.12,
          },
          label: {
            show: false,
          },
        })),
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
        force: {
          repulsion: 280,
          edgeLength: 150,
          gravity: 0.06,
        },
      },
    ],
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Точки" size="small" sx={{ bgcolor: '#e2e8f0' }} />
        <Chip label="Стрелка = маршрут" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb' }} />
      </Box>
      <Box sx={{ width: '100%', height: 500, borderRadius: 4, overflow: 'hidden', bgcolor: '#f8fbff' }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          onEvents={{
            click: (params) => {
              if (params.dataType === 'node') {
                const clicked = points.find((item) => item.id === params.data?.id);
                if (clicked) {
                  onNodeClick?.(clicked);
                }
              }
            },
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Узлы показывают точки маршрута, стрелки показывают направление отправления от одной точки к другой.
      </Typography>
    </Stack>
  );
}
