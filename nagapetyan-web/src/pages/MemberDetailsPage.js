import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

export function MemberDetailsPage() {
  const navigate = useNavigate();
  const { organizationId, memberId } = useParams();
  const { role, setRole, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(role, sessionOrganizationId);
  const [member, setMember] = useState(null);
  const [message, setMessage] = useState(null);

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  useEffect(() => {
    api.getMember(role, organizationId, memberId).then(setMember).catch((error) => setMessage(error.message));
  }, [memberId, organizationId, role]);

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Details сотрудника"
      role={role}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onRoleChange={setRole}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      actions={
        <Button component={Link} to={`/organizations/${organizationId}/members/${memberId}/edit`} variant="contained" startIcon={<EditIcon />}>
          Редактировать
        </Button>
      }
    >
      <Stack spacing={3}>
        <Typography variant="h4">Сотрудник</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography>ФИО: {member?.fullName || '-'}</Typography>
              <Typography>Email: {member?.email || '-'}</Typography>
              <Typography>Должность: {member?.position || '-'}</Typography>
              <Typography>Роль: {member?.role || '-'}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
    </AppLayout>
  );
}
