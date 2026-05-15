import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';

function positionNodes(nodes, side) {
  const centerY = 220;
  const centerX = side === 'left' ? 160 : 800;
  const spread = 300;
  const gap = nodes.length > 1 ? Math.min(84, spread / (nodes.length - 1)) : 0;
  const startY = centerY - (gap * (nodes.length - 1)) / 2;

  return nodes.map((item, index) => ({
    ...item,
    x: centerX,
    y: startY + index * gap,
  }));
}

export function OrganizationRouteGraph({ organizationName, leftNodes = [], rightNodes = [], onNodeClick }) {
  const width = 980;
  const height = 460;
  const center = { x: 490, y: 220 };
  const left = positionNodes(leftNodes, 'left');
  const right = positionNodes(rightNodes, 'right');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: height,
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <marker id="org-arrow-right" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#2563eb" />
            </marker>
            <marker id="org-arrow-left" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
              <path d="M8,0 L0,4 L8,8 z" fill="#0f766e" />
            </marker>
          </defs>

          {left.map((item) => (
            <line
              key={`left-line-${item.id}`}
              x1={center.x}
              y1={center.y}
              x2={item.x + 118}
              y2={item.y}
              stroke="#0f766e"
              strokeWidth="2"
              strokeDasharray="7 6"
              markerEnd="url(#org-arrow-left)"
            />
          ))}

          {right.map((item) => (
            <line
              key={`right-line-${item.id}`}
              x1={center.x}
              y1={center.y}
              x2={item.x - 118}
              y2={item.y}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="7 6"
              markerEnd="url(#org-arrow-right)"
            />
          ))}

          <circle cx={center.x} cy={center.y} r="72" fill="#0f172a" opacity="0.94" />
          <circle cx={center.x} cy={center.y} r="90" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="9 8" />
        </svg>
      </Box>

      <ButtonBase
        disabled
        sx={{
          position: 'absolute',
          left: `${center.x}px`,
          top: `${center.y}px`,
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 140,
          borderRadius: 4,
          color: '#fff',
          zIndex: 2,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
          <Chip label="Организация" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }} />
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
            {organizationName || 'Организация'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Нажми на узел точки
          </Typography>
        </Stack>
      </ButtonBase>

      {left.map((item) => (
        <ButtonBase
          key={item.id}
          onClick={() => onNodeClick(item)}
          sx={{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
            width: 230,
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
            <Chip label={`Откуда · ${item.count}`} size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#ecfeff', color: '#0f766e' }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Открыть точку маршрута
            </Typography>
          </Stack>
        </ButtonBase>
      ))}

      {right.map((item) => (
        <ButtonBase
          key={item.id}
          onClick={() => onNodeClick(item)}
          sx={{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
            width: 230,
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
            <Chip label={`Куда · ${item.count}`} size="small" sx={{ alignSelf: 'flex-start', bgcolor: '#eff6ff', color: '#2563eb' }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Открыть точку маршрута
            </Typography>
          </Stack>
        </ButtonBase>
      ))}
    </Box>
  );
}
