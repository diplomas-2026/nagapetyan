import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function AppLayout({
  title,
  subtitle,
  role,
  organizationId,
  organizations,
  onRoleChange,
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

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component={Link} to="/organizations" variant="outlined">
              Организации
            </Button>
            <Button component={Link} to="/login" variant="text">
              Вход
            </Button>
            <Button component={Link} to="/register" variant="text">
              Регистрация
            </Button>
            <Button variant="text" onClick={onLogout}>
              Выйти
            </Button>
          </Stack>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Роль</InputLabel>
            <Select value={role} label="Роль" onChange={(event) => onRoleChange(event.target.value)}>
              <MenuItem value="SYSTEM_ADMIN">Админ системы</MenuItem>
              <MenuItem value="OWNER">Владелец организации</MenuItem>
              <MenuItem value="EMPLOYEE">Сотрудник</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Организация</InputLabel>
            <Select value={organizationId} label="Организация" onChange={(event) => onOrganizationChange(event.target.value)}>
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
