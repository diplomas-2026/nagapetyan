import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';

export function ShipmentRouteGraph({ fromPoint, toPoint, onFromClick, onToClick }) {
  const width = 960;
  const height = 220;
  const fromX = 180;
  const toX = 780;
  const y = 110;

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: height, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)' }}>
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.8 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <marker id="route-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#2563eb" />
            </marker>
          </defs>
          <line x1={fromX + 120} y1={y} x2={toX - 120} y2={y} stroke="#2563eb" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#route-arrow)" />
        </svg>
      </Box>

      <ButtonBase
        onClick={onFromClick}
        sx={{
          position: 'absolute',
          left: `${fromX}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          width: 240,
          px: 2,
          py: 1.5,
          borderRadius: 4,
          bgcolor: '#ffffff',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: '1px solid',
          borderColor: 'rgba(15, 118, 110, 0.16)',
          zIndex: 3,
          textAlign: 'left',
        }}
      >
        <Stack spacing={0.4}>
          <Chip label="Откуда" size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#ecfeff', color: '#0f766e' }} />
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {fromPoint?.name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Открыть карточку точки
          </Typography>
        </Stack>
      </ButtonBase>

      <ButtonBase
        onClick={onToClick}
        sx={{
          position: 'absolute',
          left: `${toX}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          width: 240,
          px: 2,
          py: 1.5,
          borderRadius: 4,
          bgcolor: '#ffffff',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: '1px solid',
          borderColor: 'rgba(37, 99, 235, 0.16)',
          zIndex: 3,
          textAlign: 'left',
        }}
      >
        <Stack spacing={0.4}>
          <Chip label="Куда" size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#eff6ff', color: '#2563eb' }} />
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {toPoint?.name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Открыть карточку точки
          </Typography>
        </Stack>
      </ButtonBase>
    </Box>
  );
}
