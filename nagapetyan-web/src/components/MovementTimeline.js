import { Box, Stack, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';

const TYPE_META = {
  CREATED: {
    icon: Inventory2OutlinedIcon,
    color: '#22c55e',
    background: '#dcfce7',
  },
  ACCEPTED: {
    icon: WarehouseOutlinedIcon,
    color: '#16a34a',
    background: '#dcfce7',
  },
  IN_TRANSIT: {
    icon: LocalShippingOutlinedIcon,
    color: '#16a34a',
    background: '#dcfce7',
  },
  DELIVERED: {
    icon: CheckCircleOutlineOutlinedIcon,
    color: '#16a34a',
    background: '#dcfce7',
  },
  DELAYED: {
    icon: RouteOutlinedIcon,
    color: '#d97706',
    background: '#fef3c7',
  },
  CANCELED: {
    icon: CancelOutlinedIcon,
    color: '#dc2626',
    background: '#fee2e2',
  },
  DEFAULT: {
    icon: RouteOutlinedIcon,
    color: '#16a34a',
    background: '#dcfce7',
  },
};

function formatDate(value) {
  if (!value) {
    return '-';
  }

  if (typeof value !== 'string') {
    return value;
  }

  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function MovementTimeline({ items = [] }) {
  if (!items.length) {
    return (
      <Stack spacing={1.25}>
        <Typography variant="h6">История передвижений</Typography>
        <Typography color="text.secondary">Для этого отправления пока не добавлены этапы движения.</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.25}>
      <Typography variant="h6">История передвижений</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {items.map((item, index) => {
          const meta = TYPE_META[item.movementType] || TYPE_META.DEFAULT;
          const Icon = meta.icon;
          const isLast = index === items.length - 1;

          return (
            <Box
              key={item.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '56px minmax(0, 1fr) auto',
                columnGap: 2,
                alignItems: 'start',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.25 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: meta.background,
                    color: meta.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.85)',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                {!isLast ? (
                  <Box sx={{ width: 3, flexGrow: 1, minHeight: 28, bgcolor: meta.color, borderRadius: 999, mt: 0.5 }} />
                ) : null}
              </Box>

              <Box sx={{ minWidth: 0, pb: isLast ? 0 : 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {item.title}
                </Typography>
                {item.location ? (
                  <Typography variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                ) : null}
                {item.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.description}
                  </Typography>
                ) : null}
                <Box
                  sx={{
                    mt: 1.25,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: 'rgba(15, 23, 42, 0.03)',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'inline-flex',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Этап {index + 1}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', pt: 0.25 }}>
                {formatDate(item.eventDate)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
