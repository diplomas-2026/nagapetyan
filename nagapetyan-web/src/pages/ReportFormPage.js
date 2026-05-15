import { useEffect, useState } from 'react';
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

const emptyReport = {
  shipmentNumber: '',
  routeFrom: '',
  routeFromLatitude: '',
  routeFromLongitude: '',
  routeTo: '',
  routeToLatitude: '',
  routeToLongitude: '',
  shippedAt: '',
  plannedDeliveryDate: '',
  weight: '',
  cost: '',
  deliveredAt: '',
  status: 'IN_TRANSIT',
  responsibleDepartment: '',
  note: '',
};

export function ReportFormPage({ mode }) {
  const navigate = useNavigate();
  const { organizationId, reportId } = useParams();
  const isEdit = mode === 'edit';
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [form, setForm] = useState(emptyReport);
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
      api.getReport(token, organizationId, reportId)
        .then((data) =>
          setForm({
            shipmentNumber: data.shipmentNumber || '',
            routeFrom: data.routeFrom || '',
            routeFromLatitude: data.routeFromLatitude ?? '',
            routeFromLongitude: data.routeFromLongitude ?? '',
            routeTo: data.routeTo || '',
            routeToLatitude: data.routeToLatitude ?? '',
            routeToLongitude: data.routeToLongitude ?? '',
            shippedAt: data.shippedAt || '',
            plannedDeliveryDate: data.plannedDeliveryDate || '',
            weight: data.weight ?? '',
            cost: data.cost ?? '',
            deliveredAt: data.deliveredAt || '',
            status: data.status || 'IN_TRANSIT',
            responsibleDepartment: data.responsibleDepartment || '',
            note: data.note || '',
          }),
        )
        .catch((error) => setMessage(error.message));
    }
  }, [isEdit, organizationId, reportId, token]);

  function preparePayload() {
    return {
      ...form,
      weight: form.weight === '' ? null : form.weight,
      cost: form.cost === '' ? null : form.cost,
      routeFromLatitude: form.routeFromLatitude === '' ? null : form.routeFromLatitude,
      routeFromLongitude: form.routeFromLongitude === '' ? null : form.routeFromLongitude,
      routeToLatitude: form.routeToLatitude === '' ? null : form.routeToLatitude,
      routeToLongitude: form.routeToLongitude === '' ? null : form.routeToLongitude,
    };
  }

  async function save() {
    try {
      if (isEdit) {
        await api.updateReport(token, organizationId, reportId, preparePayload());
        window.location.assign(`/organizations/${organizationId}/reports/${reportId}`);
        return;
      }
      const created = await api.createReport(token, organizationId, preparePayload());
      window.location.assign(`/organizations/${organizationId}/reports/${created.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle={isEdit ? 'Редактирование отправления' : 'Новое отправление'}
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
            <Typography variant="h4">{isEdit ? 'Редактирование отправления' : 'Новое отправление'}</Typography>
            <TextField label="Номер отправления" value={form.shipmentNumber} onChange={(event) => setForm({ ...form, shipmentNumber: event.target.value })} fullWidth />
            <TextField label="Откуда" value={form.routeFrom} onChange={(event) => setForm({ ...form, routeFrom: event.target.value })} fullWidth />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Широта отправки"
                type="number"
                inputProps={{ step: '0.000001' }}
                value={form.routeFromLatitude}
                onChange={(event) => setForm({ ...form, routeFromLatitude: event.target.value })}
                fullWidth
              />
              <TextField
                label="Долгота отправки"
                type="number"
                inputProps={{ step: '0.000001' }}
                value={form.routeFromLongitude}
                onChange={(event) => setForm({ ...form, routeFromLongitude: event.target.value })}
                fullWidth
              />
            </Stack>
            <TextField label="Куда" value={form.routeTo} onChange={(event) => setForm({ ...form, routeTo: event.target.value })} fullWidth />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Широта назначения"
                type="number"
                inputProps={{ step: '0.000001' }}
                value={form.routeToLatitude}
                onChange={(event) => setForm({ ...form, routeToLatitude: event.target.value })}
                fullWidth
              />
              <TextField
                label="Долгота назначения"
                type="number"
                inputProps={{ step: '0.000001' }}
                value={form.routeToLongitude}
                onChange={(event) => setForm({ ...form, routeToLongitude: event.target.value })}
                fullWidth
              />
            </Stack>
            <TextField label="Дата отправки" type="date" value={form.shippedAt} onChange={(event) => setForm({ ...form, shippedAt: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Плановая дата доставки" type="date" value={form.plannedDeliveryDate} onChange={(event) => setForm({ ...form, plannedDeliveryDate: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField
              label="Вес, кг"
              type="number"
              inputProps={{ step: '0.001', min: '0' }}
              value={form.weight}
              onChange={(event) => setForm({ ...form, weight: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Стоимость, руб."
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={form.cost}
              onChange={(event) => setForm({ ...form, cost: event.target.value })}
              required
              fullWidth
            />
            <TextField label="Фактическая дата доставки" type="date" value={form.deliveredAt} onChange={(event) => setForm({ ...form, deliveredAt: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select value={form.status} label="Статус" onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <MenuItem value="IN_TRANSIT">В пути</MenuItem>
                <MenuItem value="DELIVERED">Доставлено</MenuItem>
                <MenuItem value="DELAYED">С задержкой</MenuItem>
                <MenuItem value="CANCELED">Отменено</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Ответственное подразделение" value={form.responsibleDepartment} onChange={(event) => setForm({ ...form, responsibleDepartment: event.target.value })} fullWidth />
            <TextField label="Комментарий" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} fullWidth multiline minRows={3} />
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
