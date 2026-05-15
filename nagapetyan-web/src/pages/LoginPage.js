import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { api } from '../api';
import { useSession } from '../hooks/useSession';

export function LoginPage() {
  const { setAuth } = useSession();
  const [form, setForm] = useState({ login: '', password: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nag-last-login');
    if (saved) {
      setForm((current) => ({ ...current, login: saved }));
    }
  }, []);

  async function login() {
    try {
      setLoading(true);
      const data = await api.login(form);
      localStorage.setItem('nag-last-login', form.login);
      setAuth(data);
      if (data.user?.organizationId) {
        window.location.assign(`/organizations/${data.user.organizationId}`);
      } else {
        window.location.assign('/organizations');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
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
                Введите логин и пароль для входа.
              </Typography>
            </Box>

            <TextField label="Логин" value={form.login} onChange={(event) => setForm({ ...form, login: event.target.value })} fullWidth />
            <TextField label="Пароль" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} fullWidth />

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={login} disabled={loading}>
                Войти
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)}>
        <Alert onClose={() => setMessage(null)} severity="error" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
