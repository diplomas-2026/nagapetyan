import { useState } from 'react';
import { Box, Button, Container, Divider, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const emptyRegistration = {
  organizationName: '',
  inn: '',
  region: '',
  description: '',
  fullName: '',
  email: '',
  position: '',
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyRegistration);
  const [message, setMessage] = useState(null);

  async function registerOwner() {
    try {
      const result = await api.registerOwner(form);
      localStorage.setItem('nag-role', 'OWNER');
      localStorage.setItem('nag-org-id', String(result.organization.id));
      navigate(`/organizations/${result.organization.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', px: 2 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Регистрация владельца
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Создайте организацию и первого владельца.
              </Typography>
            </Box>

            <TextField label="Название организации" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} fullWidth />
            <TextField label="ИНН" value={form.inn} onChange={(event) => setForm({ ...form, inn: event.target.value })} fullWidth />
            <TextField label="Регион" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} fullWidth />
            <TextField label="Описание" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={3} />
            <Divider />
            <TextField label="ФИО владельца" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} fullWidth />
            <TextField label="Email владельца" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} fullWidth />
            <TextField label="Должность" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} fullWidth />

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={registerOwner}>
                Зарегистрировать
              </Button>
              <Button component={Link} to="/login" variant="outlined">
                Назад ко входу
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </Box>
  );
}
