import { useEffect, useState } from 'react';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const ROLE_OPTIONS = [
  { value: 'SYSTEM_ADMIN', label: 'Админ системы' },
  { value: 'OWNER', label: 'Владелец организации' },
  { value: 'EMPLOYEE', label: 'Сотрудник' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('nag-role') || 'SYSTEM_ADMIN');
  const [organizationId, setOrganizationId] = useState(localStorage.getItem('nag-org-id') || '');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const data = await api.getOrganizations('SYSTEM_ADMIN');
      setOrganizations(Array.isArray(data) ? data : []);
      if (!organizationId && data[0]) {
        setOrganizationId(String(data[0].id));
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function enterCabinet() {
    localStorage.setItem('nag-role', role);
    if (organizationId) {
      localStorage.setItem('nag-org-id', organizationId);
      navigate(`/organizations/${organizationId}`);
      return;
    }
    navigate('/organizations');
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', px: 2 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Вход в систему
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Выберите роль и организацию для демонстрации кабинета.
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={role} label="Роль" onChange={(event) => setRole(event.target.value)}>
                {ROLE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Организация</InputLabel>
              <Select value={organizationId} label="Организация" onChange={(event) => setOrganizationId(event.target.value)}>
                {organizations.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={enterCabinet} disabled={loading}>
                Войти
              </Button>
              <Button component={Link} to="/register" variant="outlined">
                Регистрация владельца
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </Box>
  );
}
