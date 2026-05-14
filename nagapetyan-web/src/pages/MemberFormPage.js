import { useEffect, useState } from 'react';
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

const emptyMember = {
  fullName: '',
  email: '',
  position: '',
  role: 'EMPLOYEE',
};

export function MemberFormPage({ mode }) {
  const navigate = useNavigate();
  const { organizationId, memberId } = useParams();
  const isEdit = mode === 'edit';
  const { role, setRole, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(role, sessionOrganizationId);
  const [form, setForm] = useState(emptyMember);
  const [message, setMessage] = useState(null);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    if (isEdit) {
      api.getMember(role, organizationId, memberId).then(setForm).catch((error) => setMessage(error.message));
    }
  }, [isEdit, memberId, organizationId, role]);

  async function save() {
    try {
      if (isEdit) {
        await api.updateMember(role, organizationId, memberId, form);
        navigate(`/organizations/${organizationId}/members/${memberId}`);
        return;
      }
      const created = await api.createMember(role, organizationId, form);
      navigate(`/organizations/${organizationId}/members/${created.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование сотрудника' : 'Новый сотрудник'}
      role={role}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onRoleChange={setRole}
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
            <TextField label="ФИО" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} fullWidth />
            <TextField label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} fullWidth />
            <TextField label="Должность" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={form.role} label="Роль" onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <MenuItem value="OWNER">Владелец</MenuItem>
                <MenuItem value="EMPLOYEE">Сотрудник</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={save}>
                Сохранить
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}`} variant="outlined">
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
