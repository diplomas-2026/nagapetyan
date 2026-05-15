import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

export function ReportImportPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
  }, [organizationId, setOrganizationId]);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  async function upload() {
    if (!file) {
      setMessage('Выберите файл Excel или CSV');
      return;
    }

    try {
      setLoading(true);
      await api.importReports(token, organizationId, file);
      navigate(`/organizations/${organizationId}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Импорт отправлений из отчета"
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
            <Typography variant="h4">Загрузить отчет</Typography>
            <Typography color="text.secondary">
              Для руководителя это загрузка отчета, а внутри системы файл будет обработан как импорт отправлений.
            </Typography>
            <Typography color="text.secondary">
              Поддерживаются колонки: номер отправления, откуда, куда, дата отправки, плановая дата доставки, вес, стоимость, статус и комментарий.
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Выбрать файл
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </Button>
            <Typography>{file ? `Выбран файл: ${file.name}` : 'Файл не выбран'}</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={upload} disabled={loading}>
                Загрузить отчет
              </Button>
              <Button component={Link} to={`/organizations/${organizationId}`} variant="outlined">
                Отмена
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)}>
        <Alert onClose={() => setMessage(null)} severity="error" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
