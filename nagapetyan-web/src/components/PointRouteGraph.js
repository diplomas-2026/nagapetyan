import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';

function positionNodes(nodes, side) {
  const centerY = 210;
  const centerX = side === 'left' ? 170 : 790;
  const spread = 280;
  const gap = nodes.length > 1 ? Math.min(88, spread / (nodes.length - 1)) : 0;
  const startY = centerY - (gap * (nodes.length - 1)) / 2;

  return nodes.map((item, index) => ({
    ...item,
    x: centerX,
    y: startY + index * gap,
  }));
}

export function PointRouteGraph({ centerPoint, incoming = [], outgoing = [], onNodeClick }) {
  const incomingNodes = positionNodes(incoming, 'left');
  const outgoingNodes = positionNodes(outgoing, 'right');
  const width = 960;
  const height = 420;
  const center = { x: 480, y: 210 };

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: height, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)' }}>
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <marker id="arrow-right" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-left" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
              <path d="M8,0 L0,4 L8,8 z" fill="#0f766e" />
            </marker>
          </defs>

          {incomingNodes.map((item) => (
            <line
              key={`line-in-${item.id}`}
              x1={center.x}
              y1={center.y}
              x2={item.x + 110}
              y2={item.y}
              stroke="#0f766e"
              strokeWidth="2"
              strokeDasharray="6 5"
              markerEnd="url(#arrow-left)"
            />
          ))}

          {outgoingNodes.map((item) => (
            <line
              key={`line-out-${item.id}`}
              x1={center.x}
              y1={center.y}
              x2={item.x - 110}
              y2={item.y}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="6 5"
              markerEnd="url(#arrow-right)"
            />
          ))}

          <circle cx={center.x} cy={center.y} r="62" fill="#0f172a" opacity="0.92" />
          <circle cx={center.x} cy={center.y} r="76" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="8 8" />
        </svg>
      </Box>

      <ButtonBase
        disabled
        sx={{
          position: 'absolute',
          left: `${center.x}px`,
          top: `${center.y}px`,
          transform: 'translate(-50%, -50%)',
          width: 180,
          height: 120,
          borderRadius: 4,
          color: '#fff',
          zIndex: 2,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
          <Chip label="Центр" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }} />
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
            {centerPoint?.name || 'Точка'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Нажимай на соседние точки
          </Typography>
        </Stack>
      </ButtonBase>

      {incomingNodes.map((item) => (
        <ButtonBase
          key={item.id}
          onClick={() => onNodeClick(item)}
          sx={{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
            width: 220,
            px: 2,
            py: 1.5,
            borderRadius: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid',
            borderColor: 'rgba(15, 118, 110, 0.18)',
            zIndex: 3,
            textAlign: 'left',
          }}
        >
          <Stack spacing={0.4}>
            <Chip label={`В точку · ${item.value}`} size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#ecfeff', color: '#0f766e' }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Открыть информацию о пункте
            </Typography>
          </Stack>
        </ButtonBase>
      ))}

      {outgoingNodes.map((item) => (
        <ButtonBase
          key={item.id}
          onClick={() => onNodeClick(item)}
          sx={{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
            width: 220,
            px: 2,
            py: 1.5,
            borderRadius: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid',
            borderColor: 'rgba(37, 99, 235, 0.18)',
            zIndex: 3,
            textAlign: 'left',
          }}
        >
          <Stack spacing={0.4}>
            <Chip label={`Из точки · ${item.value}`} size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#eff6ff', color: '#2563eb' }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Открыть информацию о пункте
            </Typography>
          </Stack>
        </ButtonBase>
      ))}
    </Box>
  );
}
