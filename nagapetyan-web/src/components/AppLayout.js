import { AppBar, Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getRoleLabel } from '../utils/labels';

export function AppLayout({
  title,
  subtitle,
  user,
  organizationId,
  organizations,
  onOrganizationChange,
  onLogout,
  actions,
  children,
}) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Stack sx={{ flexGrow: 1 }} spacing={0.25}>
            <Typography variant="h6">{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>

          {user ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={user.fullName || user.login} variant="outlined" />
              <Chip label={getRoleLabel(user.role)} color="primary" variant="outlined" />
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component={Link} to="/organizations" reloadDocument variant="outlined">
              Организации
            </Button>
            <Button variant="text" onClick={onLogout}>
              Выйти
            </Button>
          </Stack>

          <FormControl size="small" sx={{ minWidth: 260 }} disabled={!organizations.length}>
            <InputLabel>Организация</InputLabel>
            <Select value={organizationId || ''} label="Организация" onChange={(event) => onOrganizationChange(event.target.value)}>
              {organizations.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {actions}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)' }}>
          {children}
        </Paper>
      </Box>
    </Box>
  );
}
