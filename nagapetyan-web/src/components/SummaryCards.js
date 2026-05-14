import { Box, Card, CardContent, Typography } from '@mui/material';

export function SummaryCards({ items }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
      }}
    >
      {items.map((item) => (
        <Card key={item.label} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {item.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
