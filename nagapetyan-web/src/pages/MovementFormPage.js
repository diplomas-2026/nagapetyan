import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { getMovementTypeLabel } from '../utils/labels';

const emptyMovement = {
  movementType: 'CREATED',
  title: '',
  location: '',
  eventDate: '',
  description: '',
  sortOrder: '',
};

const MOVEMENT_TYPE_OPTIONS = ['CREATED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELED'];

export function MovementFormPage({ mode }) {
  const navigate = useNavigate();
  const { organizationId, reportId, movementId } = useParams();
  const isEdit = mode === 'edit';
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [form, setForm] = useState(emptyMovement);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
  }, [organizationId, setOrganizationId]);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    api
      .getMovement(token, organizationId, reportId, movementId)
      .then((data) =>
        setForm({
          movementType: data.movementType || 'CREATED',
          title: data.title || '',
          location: data.location || '',
          eventDate: data.eventDate || '',
          description: data.description || '',
          sortOrder: data.sortOrder ?? '',
        }),
      )
      .catch((error) => setMessage(error.message));
  }, [isEdit, movementId, organizationId, reportId, token]);

  const typeLabel = useMemo(() => getMovementTypeLabel(form.movementType), [form.movementType]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  function preparePayload() {
    const sortOrder = form.sortOrder === '' ? null : Number(form.sortOrder);
    return {
      ...form,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : null,
    };
  }

  async function save() {
    try {
      if (isEdit) {
        await api.updateMovement(token, organizationId, reportId, movementId, preparePayload());
        window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
        return;
      }
      await api.createMovement(token, organizationId, reportId, preparePayload());
      window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование этапа передвижения' : 'Новый этап передвижения'}
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
            <Stack spacing={0.5}>
              <Typography variant="h4">{isEdit ? 'Редактирование этапа' : 'Новый этап передвижения'}</Typography>
              <Typography color="text.secondary">Отправление #{reportId}</Typography>
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Тип этапа</InputLabel>
              <Select value={form.movementType} label="Тип этапа" onChange={(event) => setForm({ ...form, movementType: event.target.value })}>
                {MOVEMENT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {getMovementTypeLabel(option)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Заголовок" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} fullWidth required />
            <TextField label="Локация" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} fullWidth />
            <TextField
              label="Дата события"
              type="date"
              value={form.eventDate}
              onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Описание"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Порядок сортировки"
              type="number"
              inputProps={{ min: '1', step: '1' }}
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
              fullWidth
              helperText={`Текущий тип: ${typeLabel}. Если оставить поле пустым, порядок назначится автоматически.`}
            />

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={save}>
                Сохранить
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}/reports/${reportId}`} reloadDocument variant="outlined">
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
