import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

const emptyOrganization = {
  name: '',
  inn: '',
  region: '',
  description: '',
};

export function OrganizationFormPage({ mode }) {
  const navigate = useNavigate();
  const params = useParams();
  const targetId = params.organizationId;
  const isEdit = mode === 'edit';
  const { role, setRole, organizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(role, organizationId);
  const [form, setForm] = useState(emptyOrganization);
  const [message, setMessage] = useState(null);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    if (isEdit && targetId) {
      api.getOrganization(role, organizationId, targetId).then(setForm).catch((error) => setMessage(error.message));
    }
  }, [isEdit, organizationId, role, targetId]);

  async function save() {
    try {
      if (isEdit) {
        const updated = await api.updateOrganization(role, targetId, form);
        navigate(`/organizations/${updated.id}`);
      } else {
        const created = await api.createOrganization(role, organizationId || undefined, form);
        navigate(`/organizations/${created.id}`);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование организации' : 'Создание организации'}
      role={role}
      organizationId={organizationId}
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
            <Typography variant="h4">{isEdit ? 'Редактирование организации' : 'Новая организация'}</Typography>
            <TextField label="Название" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} fullWidth />
            <TextField label="ИНН" value={form.inn} onChange={(event) => setForm({ ...form, inn: event.target.value })} fullWidth />
            <TextField label="Регион" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} fullWidth />
            <TextField label="Описание" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={4} />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={save}>
                Сохранить
              </Button>
              <Button component={Link} to={isEdit ? `/organizations/${targetId}` : '/organizations'} variant="outlined">
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
