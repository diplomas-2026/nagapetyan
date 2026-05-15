import { Box, Chip, Stack, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

export function ShipmentRouteGraph({ fromPoint, toPoint, onFromClick, onToClick }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.data?.id === 'from') {
          return `Откуда<br/>${fromPoint?.name || '-'}`;
        }
        if (params.data?.id === 'to') {
          return `Куда<br/>${toPoint?.name || '-'}`;
        }
        return '';
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: false,
        draggable: true,
        data: [
          {
            id: 'from',
            name: fromPoint?.name || 'Откуда',
            category: 0,
            symbolSize: 94,
            itemStyle: {
              color: '#0f766e',
              borderColor: '#ffffff',
              borderWidth: 2,
            },
            label: {
              position: 'bottom',
              color: '#0f172a',
              fontWeight: 700,
            },
          },
          {
            id: 'to',
            name: toPoint?.name || 'Куда',
            category: 1,
            symbolSize: 94,
            itemStyle: {
              color: '#2563eb',
              borderColor: '#ffffff',
              borderWidth: 2,
            },
            label: {
              position: 'bottom',
              color: '#0f172a',
              fontWeight: 700,
            },
          },
        ],
        links: [
          {
            source: 'from',
            target: 'to',
            lineStyle: {
              color: '#2563eb',
              width: 3,
            },
          },
        ],
        force: {
          repulsion: 200,
          edgeLength: 220,
          gravity: 0.08,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
      },
    ],
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Откуда" size="small" sx={{ bgcolor: '#ecfeff', color: '#0f766e' }} />
        <Chip label="Куда" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb' }} />
      </Box>
      <Box sx={{ width: '100%', height: 260, borderRadius: 4, overflow: 'hidden', bgcolor: '#f8fbff' }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          onEvents={{
            click: (params) => {
              if (params.data?.id === 'from') {
                onFromClick?.();
              }
              if (params.data?.id === 'to') {
                onToClick?.();
              }
            },
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Нажми на узел маршрута, чтобы открыть карточку точки.
      </Typography>
    </Stack>
  );
}
