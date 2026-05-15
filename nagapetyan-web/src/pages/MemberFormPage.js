import { useEffect, useState } from 'react';
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { getRoleLabel } from '../utils/labels';

const emptyMember = {
  login: '',
  password: '',
  fullName: '',
  email: '',
  position: '',
  role: 'EMPLOYEE',
};

export function MemberFormPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizationId, memberId } = useParams();
  const isEdit = mode === 'edit';
  const initialRole = new URLSearchParams(location.search).get('role') || 'EMPLOYEE';
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [form, setForm] = useState(() => ({ ...emptyMember, role: initialRole }));
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
  }, [organizationId, setOrganizationId]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    if (isEdit) {
      api.getMember(token, organizationId, memberId).then((data) => {
        setForm({
          login: data.login || '',
          password: '',
          fullName: data.fullName || '',
          email: data.email || '',
          position: data.position || '',
          role: data.role || 'EMPLOYEE',
        });
      }).catch((error) => setMessage(error.message));
    }
  }, [initialRole, isEdit, memberId, organizationId, token]);

  async function save() {
    try {
      if (isEdit) {
        await api.updateMember(token, organizationId, memberId, form);
        window.location.assign(`/organizations/${organizationId}/members/${memberId}`);
        return;
      }
      const created = await api.createMember(token, organizationId, form);
      window.location.assign(`/organizations/${organizationId}/members/${created.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование сотрудника' : 'Новый сотрудник'}
      user={user}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
    >
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h4">{isEdit ? 'Редактирование сотрудника' : 'Новый сотрудник'}</Typography>
            <TextField label="Логин" value={form.login} onChange={(event) => setForm({ ...form, login: event.target.value })} fullWidth />
            <TextField
              label={isEdit ? 'Новый пароль' : 'Пароль'}
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              fullWidth
              helperText={isEdit ? 'Оставьте пустым, если пароль менять не нужно' : ''}
            />
            <TextField label="ФИО" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} fullWidth />
            <TextField label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} fullWidth />
            <TextField label="Должность" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={form.role} label="Роль" onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <MenuItem value="OWNER">{getRoleLabel('OWNER')}</MenuItem>
                <MenuItem value="EMPLOYEE">{getRoleLabel('EMPLOYEE')}</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={save}>
                Сохранить
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}`} reloadDocument variant="outlined">
                Отмена
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </AppLayout>
  );
}
