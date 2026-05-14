import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { api } from './api';

const ROLE_OPTIONS = [
  { value: 'SYSTEM_ADMIN', label: 'Админ системы' },
  { value: 'OWNER', label: 'Владелец организации' },
  { value: 'EMPLOYEE', label: 'Сотрудник' },
];

const emptyOrganization = {
  name: '',
  inn: '',
  region: '',
  description: '',
};

const emptyMember = {
  fullName: '',
  email: '',
  position: '',
  role: 'EMPLOYEE',
};

const emptyReport = {
  shipmentNumber: '',
  routeFrom: '',
  routeTo: '',
  shippedAt: '',
  plannedDeliveryDate: '',
  deliveredAt: '',
  status: 'IN_TRANSIT',
  responsibleDepartment: '',
  note: '',
};

function App() {
  const [role, setRole] = useState(localStorage.getItem('nag-role') || 'SYSTEM_ADMIN');
  const [organizationId, setOrganizationId] = useState(localStorage.getItem('nag-org-id') || '');
  const [organizations, setOrganizations] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [organizationDialogOpen, setOrganizationDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [organizationForm, setOrganizationForm] = useState(emptyOrganization);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [reportForm, setReportForm] = useState(emptyReport);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    localStorage.setItem('nag-role', role);
  }, [role]);

  useEffect(() => {
    if (organizationId) {
      localStorage.setItem('nag-org-id', organizationId);
    } else {
      localStorage.removeItem('nag-org-id');
    }
  }, [organizationId]);

  const activeOrganization = useMemo(
    () => organizations.find((item) => String(item.id) === String(organizationId)) || null,
    [organizationId, organizations]
  );

  const canEditOrganizations = role === 'SYSTEM_ADMIN';
  const canEditOrganizationData = role !== 'EMPLOYEE';

  useEffect(() => {
    loadOrganizations();
  }, [role]);

  useEffect(() => {
    if (!organizationId && organizations.length > 0) {
      setOrganizationId(String(organizations[0].id));
    }
  }, [organizations, organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setDashboard(null);
      setMembers([]);
      setReports([]);
      return;
    }

    loadOrganizationData();
  }, [organizationId, role]);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const data = await api.getOrganizations(role, organizationId || undefined);
      setOrganizations(Array.isArray(data) ? data : []);
      if (organizationId && !data.some((item) => String(item.id) === String(organizationId))) {
        setOrganizationId(data[0] ? String(data[0].id) : '');
      }
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrganizationData() {
    try {
      setLoading(true);
      const [dashboardData, membersData, reportsData] = await Promise.all([
        api.getDashboard(role, organizationId),
        api.getMembers(role, organizationId),
        api.getReports(role, organizationId),
      ]);
      setDashboard(dashboardData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text) {
    setMessage(text);
  }

  function openOrganizationDialog(item = null) {
    setEditingOrganization(item);
    setOrganizationForm(
      item
        ? {
            name: item.name || '',
            inn: item.inn || '',
            region: item.region || '',
            description: item.description || '',
          }
        : emptyOrganization
    );
    setOrganizationDialogOpen(true);
  }

  function openMemberDialog(item = null) {
    setEditingMember(item);
    setMemberForm(
      item
        ? {
            fullName: item.fullName || '',
            email: item.email || '',
            position: item.position || '',
            role: item.role || 'EMPLOYEE',
          }
        : emptyMember
    );
    setMemberDialogOpen(true);
  }

  function openReportDialog(item = null) {
    setEditingReport(item);
    setReportForm(
      item
        ? {
            shipmentNumber: item.shipmentNumber || '',
            routeFrom: item.routeFrom || '',
            routeTo: item.routeTo || '',
            shippedAt: item.shippedAt || '',
            plannedDeliveryDate: item.plannedDeliveryDate || '',
            deliveredAt: item.deliveredAt || '',
            status: item.status || 'IN_TRANSIT',
            responsibleDepartment: item.responsibleDepartment || '',
            note: item.note || '',
          }
        : emptyReport
    );
    setReportDialogOpen(true);
  }

  async function saveOrganization() {
    try {
      if (editingOrganization) {
        await api.updateOrganization(role, editingOrganization.id, organizationForm);
        showMessage('Организация обновлена');
      } else {
        await api.createOrganization(role, organizationId || undefined, organizationForm);
        showMessage('Организация создана');
      }
      setOrganizationDialogOpen(false);
      await loadOrganizations();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteOrganization(item) {
    try {
      await api.deleteOrganization(role, item.id);
      showMessage('Организация удалена');
      await loadOrganizations();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function saveMember() {
    try {
      if (editingMember) {
        await api.updateMember(role, organizationId, editingMember.id, memberForm);
        showMessage('Сотрудник обновлен');
      } else {
        await api.createMember(role, organizationId, memberForm);
        showMessage('Сотрудник добавлен');
      }
      setMemberDialogOpen(false);
      await loadOrganizationData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteMember(item) {
    try {
      await api.deleteMember(role, organizationId, item.id);
      showMessage('Сотрудник удален');
      await loadOrganizationData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function saveReport() {
    try {
      if (editingReport) {
        await api.updateReport(role, organizationId, editingReport.id, reportForm);
        showMessage('Запись отчета обновлена');
      } else {
        await api.createReport(role, organizationId, reportForm);
        showMessage('Запись отчета добавлена');
      }
      setReportDialogOpen(false);
      await loadOrganizationData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteReport(item) {
    try {
      await api.deleteReport(role, organizationId, item.id);
      showMessage('Запись отчета удалена');
      await loadOrganizationData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function importReports() {
    if (!importFile) {
      showMessage('Выберите файл для импорта');
      return;
    }
    try {
      const result = await api.importReports(role, organizationId, importFile);
      showMessage(`Импортировано: ${result.imported}, пропущено: ${result.skipped}`);
      setImportFile(null);
      await loadOrganizationData();
    } catch (error) {
      showMessage(error.message);
    }
  }

  const summaryCards = dashboard?.summary
    ? [
        { label: 'Всего записей', value: dashboard.summary.totalRecords },
        { label: 'Вовремя', value: dashboard.summary.deliveredOnTime },
        { label: 'С задержкой', value: dashboard.summary.delayed },
        { label: 'Процент вовремя', value: `${dashboard.summary.onTimePercent.toFixed(1)}%` },
        { label: 'Средний срок', value: `${dashboard.summary.averageTransitDays.toFixed(1)} дн.` },
      ]
    : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <LocalShippingIcon />
            </Box>
            <Box>
              <Typography variant="h6">Логистика и отчетность</Typography>
              <Typography variant="body2" color="text.secondary">
                Организации, владельцы и сотрудники
              </Typography>
            </Box>
          </Stack>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Роль</InputLabel>
            <Select value={role} label="Роль" onChange={(event) => setRole(event.target.value)}>
              {ROLE_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Организация</InputLabel>
            <Select
              value={organizationId}
              label="Организация"
              onChange={(event) => setOrganizationId(event.target.value)}
            >
              {organizations.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)',
          }}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Панель логистической отчетности
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                  Простая система для управления организациями, сотрудниками и отчетами по логистике.
                  Поддерживается ручной ввод, редактирование и импорт из Excel/CSV.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={ROLE_OPTIONS.find((item) => item.value === role)?.label || role} color="primary" />
                {activeOrganization ? <Chip label={activeOrganization.region || activeOrganization.name} variant="outlined" /> : null}
                <Chip label={loading ? 'Загрузка...' : 'Готово'} color={loading ? 'warning' : 'success'} variant="outlined" />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
            mt: 0,
          }}
        >
          {summaryCards.map((item) => (
            <Card key={item.label} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack spacing={3} sx={{ mt: 3 }}>
          {canEditOrganizations ? (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <BusinessIcon color="primary" />
                    <Typography variant="h6">Организации</Typography>
                  </Stack>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => openOrganizationDialog()}>
                    Добавить организацию
                  </Button>
                </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>ИНН</TableCell>
                      <TableCell>Регион</TableCell>
                      <TableCell>Владельцы</TableCell>
                      <TableCell>Сотрудники</TableCell>
                      <TableCell>Отчеты</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations.map((item) => (
                      <TableRow key={item.id} hover selected={String(item.id) === String(organizationId)}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.inn}</TableCell>
                        <TableCell>{item.region}</TableCell>
                        <TableCell>{item.ownersCount}</TableCell>
                        <TableCell>{item.employeesCount}</TableCell>
                        <TableCell>{item.reportsCount}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <IconButton size="small" onClick={() => openOrganizationDialog(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteOrganization(item)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <GroupIcon color="primary" />
                    <Typography variant="h6">Сотрудники</Typography>
                  </Stack>
                  {canEditOrganizationData ? (
                    <Button startIcon={<AddIcon />} variant="contained" onClick={() => openMemberDialog()}>
                      Добавить сотрудника
                    </Button>
                  ) : null}
                </Stack>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ФИО</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Должность</TableCell>
                      <TableCell>Роль</TableCell>
                      {canEditOrganizationData ? <TableCell align="right">Действия</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.fullName}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.position}</TableCell>
                        <TableCell>{item.role}</TableCell>
                        {canEditOrganizationData ? (
                          <TableCell align="right">
                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                              <IconButton size="small" onClick={() => openMemberDialog(item)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => deleteMember(item)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalShippingIcon color="primary" />
                    <Typography variant="h6">Отчеты</Typography>
                  </Stack>
                  {canEditOrganizationData ? (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Button startIcon={<UploadFileIcon />} variant="outlined" component="label">
                        Импорт
                        <input
                          hidden
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                        />
                      </Button>
                      <Button variant="contained" onClick={importReports} disabled={!importFile}>
                        Загрузить
                      </Button>
                      <Button startIcon={<AddIcon />} variant="contained" onClick={() => openReportDialog()}>
                        Добавить запись
                      </Button>
                    </Stack>
                  ) : null}
                </Stack>

                {importFile ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Выбран файл: {importFile.name}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Формат импорта: shipmentNumber, shippedAt, plannedDeliveryDate, deliveredAt, routeFrom, routeTo, status, responsibleDepartment, note
                  </Alert>
                )}

                <Divider sx={{ mb: 2 }} />

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер</TableCell>
                      <TableCell>Маршрут</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Срок</TableCell>
                      {canEditOrganizationData ? <TableCell align="right">Действия</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.shipmentNumber}</TableCell>
                        <TableCell>
                          {item.routeFrom} → {item.routeTo}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={item.status} color={item.delayed ? 'error' : 'success'} variant="outlined" />
                        </TableCell>
                        <TableCell>{item.transitDays} дн.</TableCell>
                        {canEditOrganizationData ? (
                          <TableCell align="right">
                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                              <IconButton size="small" onClick={() => openReportDialog(item)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => deleteReport(item)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>

      <Dialog open={organizationDialogOpen} onClose={() => setOrganizationDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingOrganization ? 'Редактировать организацию' : 'Новая организация'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Название" value={organizationForm.name} onChange={(event) => setOrganizationForm({ ...organizationForm, name: event.target.value })} fullWidth />
            <TextField label="ИНН" value={organizationForm.inn} onChange={(event) => setOrganizationForm({ ...organizationForm, inn: event.target.value })} fullWidth />
            <TextField label="Регион" value={organizationForm.region} onChange={(event) => setOrganizationForm({ ...organizationForm, region: event.target.value })} fullWidth />
            <TextField label="Описание" value={organizationForm.description} onChange={(event) => setOrganizationForm({ ...organizationForm, description: event.target.value })} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrganizationDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={saveOrganization}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingMember ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="ФИО" value={memberForm.fullName} onChange={(event) => setMemberForm({ ...memberForm, fullName: event.target.value })} fullWidth />
            <TextField label="Email" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} fullWidth />
            <TextField label="Должность" value={memberForm.position} onChange={(event) => setMemberForm({ ...memberForm, position: event.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={memberForm.role} label="Роль" onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}>
                <MenuItem value="OWNER">Владелец</MenuItem>
                <MenuItem value="EMPLOYEE">Сотрудник</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={saveMember}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingReport ? 'Редактировать запись' : 'Новая запись отчета'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Номер отправления" value={reportForm.shipmentNumber} onChange={(event) => setReportForm({ ...reportForm, shipmentNumber: event.target.value })} fullWidth />
            <TextField label="Откуда" value={reportForm.routeFrom} onChange={(event) => setReportForm({ ...reportForm, routeFrom: event.target.value })} fullWidth />
            <TextField label="Куда" value={reportForm.routeTo} onChange={(event) => setReportForm({ ...reportForm, routeTo: event.target.value })} fullWidth />
            <TextField label="Дата отправки" type="date" value={reportForm.shippedAt} onChange={(event) => setReportForm({ ...reportForm, shippedAt: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Плановая дата доставки" type="date" value={reportForm.plannedDeliveryDate} onChange={(event) => setReportForm({ ...reportForm, plannedDeliveryDate: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Фактическая дата доставки" type="date" value={reportForm.deliveredAt} onChange={(event) => setReportForm({ ...reportForm, deliveredAt: event.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select value={reportForm.status} label="Статус" onChange={(event) => setReportForm({ ...reportForm, status: event.target.value })}>
                <MenuItem value="IN_TRANSIT">В пути</MenuItem>
                <MenuItem value="DELIVERED">Доставлено</MenuItem>
                <MenuItem value="DELAYED">С задержкой</MenuItem>
                <MenuItem value="CANCELED">Отменено</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Ответственное подразделение" value={reportForm.responsibleDepartment} onChange={(event) => setReportForm({ ...reportForm, responsibleDepartment: event.target.value })} fullWidth />
            <TextField label="Комментарий" value={reportForm.note} onChange={(event) => setReportForm({ ...reportForm, note: event.target.value })} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={saveReport}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </Box>
  );
}

export default App;
