import { useEffect, useState } from 'react';
import { Autocomplete, Button, Card, CardContent, CircularProgress, Divider, FormControlLabel, Radio, RadioGroup, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

const emptyForm = {
  name: '',
  inn: '',
  region: '',
  description: '',
  ownerMode: 'new',
  existingOwnerLogin: '',
  owner: {
    login: '',
    password: '',
    fullName: '',
    email: '',
    position: '',
  },
};

export function OrganizationFormPage({ mode }) {
  const navigate = useNavigate();
  const params = useParams();
  const targetId = params.organizationId;
  const isEdit = mode === 'edit';
  const { token, user, organizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (targetId) {
      setOrganizationId(targetId);
    }
  }, [setOrganizationId, targetId]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    if (isEdit && targetId) {
      let cancelled = false;
      setLoading(true);
      api.getOrganization(token, targetId)
        .then((data) => {
          if (cancelled) {
            return;
          }
          setForm((current) => ({
            ...current,
            name: data.name || '',
            inn: data.inn || '',
            region: data.region || '',
            description: data.description || '',
          }));
        })
        .catch((error) => {
          if (!cancelled) {
            setMessage(error.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [isEdit, targetId, token]);

  useEffect(() => {
    if (isEdit || !token) {
      return;
    }

    let cancelled = false;

    async function loadOwners() {
      try {
        setOwnersLoading(true);
        const data = await api.getOwners(token);
        if (!cancelled) {
          setOwners(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setOwners([]);
          setMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setOwnersLoading(false);
        }
      }
    }

    loadOwners();

    return () => {
      cancelled = true;
    };
  }, [isEdit, token]);

  async function save() {
    try {
      setSaving(true);
      if (isEdit) {
        const updated = await api.updateOrganization(token, targetId, {
          name: form.name,
          inn: form.inn,
          region: form.region,
          description: form.description,
        });
        window.location.assign(`/organizations/${updated.id}`);
      } else {
        const payload = {
          name: form.name,
          inn: form.inn,
          region: form.region,
          description: form.description,
          ownerMode: form.ownerMode,
          existingOwnerLogin: form.ownerMode === 'existing' ? form.existingOwnerLogin : '',
          owner: form.ownerMode === 'new' ? form.owner : null,
        };
        const created = await api.createOrganization(token, payload);
        window.location.assign(`/organizations/${created.id}`);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование организации' : 'Создание организации'}
      user={user}
      organizationId={organizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      loading={loading || ownersLoading || saving}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
    >
      <Card>
        <CardContent>
          {loading && isEdit ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : (
          <Stack spacing={3}>
            <Typography variant="h4">{isEdit ? 'Редактирование организации' : 'Новая организация'}</Typography>
            <TextField label="Название" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} fullWidth />
            <TextField label="ИНН" value={form.inn} onChange={(event) => setForm({ ...form, inn: event.target.value })} fullWidth />
            <TextField label="Регион" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} fullWidth />
            <TextField label="Описание" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={4} />

            {!isEdit ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="h6">Первый владелец</Typography>
                  <Typography color="text.secondary">
                    Можно создать новый аккаунт владельца или передать доступ уже существующему владельцу.
                  </Typography>
                </Stack>
                <RadioGroup
                  value={form.ownerMode}
                  onChange={(event) => setForm((current) => ({ ...current, ownerMode: event.target.value }))}
                >
                  <FormControlLabel value="new" control={<Radio />} label="Создать нового владельца" />
                  <FormControlLabel value="existing" control={<Radio />} label="Дать доступ существующему владельцу" />
                </RadioGroup>

                {form.ownerMode === 'existing' ? (
                  <Autocomplete
                    options={owners}
                    loading={ownersLoading}
                    value={owners.find((owner) => owner.login === form.existingOwnerLogin) || null}
                    onChange={(_, nextOwner) => {
                      setForm((current) => ({ ...current, existingOwnerLogin: nextOwner?.login || '' }));
                    }}
                    getOptionLabel={(option) =>
                      option
                        ? `${option.fullName || option.login} · ${option.login}${option.organizationId ? ` · орг. ${option.organizationId}` : ''}`
                        : ''
                    }
                    isOptionEqualToValue={(option, value) => option.login === value.login}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Выберите существующего владельца"
                        helperText="В списке доступны все владельцы системы. Он будет назначен первым владельцем новой организации."
                      />
                    )}
                  />
                ) : (
                  <>
                    <TextField
                      label="Логин"
                      value={form.owner.login}
                      onChange={(event) => setForm((current) => ({ ...current, owner: { ...current.owner, login: event.target.value } }))}
                      fullWidth
                    />
                    <TextField
                      label="Пароль"
                      type="password"
                      value={form.owner.password}
                      onChange={(event) => setForm((current) => ({ ...current, owner: { ...current.owner, password: event.target.value } }))}
                      fullWidth
                    />
                    <TextField
                      label="ФИО"
                      value={form.owner.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, owner: { ...current.owner, fullName: event.target.value } }))}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      value={form.owner.email}
                      onChange={(event) => setForm((current) => ({ ...current, owner: { ...current.owner, email: event.target.value } }))}
                      fullWidth
                    />
                    <TextField
                      label="Должность"
                      value={form.owner.position}
                      onChange={(event) => setForm((current) => ({ ...current, owner: { ...current.owner, position: event.target.value } }))}
                      fullWidth
                    />
                  </>
                )}
              </>
            ) : null}

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={save} disabled={loading || ownersLoading || saving}>
                {saving ? <CircularProgress size={18} color="inherit" /> : 'Сохранить'}
              </Button>
              <Button component={Link} to={isEdit ? `/organizations/${targetId}` : '/organizations'} reloadDocument variant="outlined">
                Отмена
              </Button>
            </Stack>
          </Stack>
          )}
        </CardContent>
      </Card>
      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </AppLayout>
  );
}
