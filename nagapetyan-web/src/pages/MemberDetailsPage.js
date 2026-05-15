import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { ActionHistoryList } from '../components/ActionHistoryList';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { getRoleLabel } from '../utils/labels';

export function MemberDetailsPage() {
  const navigate = useNavigate();
  const { organizationId, memberId } = useParams();
  const { token, user, organizationId: sessionOrganizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(token);
  const [member, setMember] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [message, setMessage] = useState(null);
  const [historyMessage, setHistoryMessage] = useState(null);

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

  useEffect(() => {
    api.getMember(token, organizationId, memberId).then(setMember).catch((error) => setMessage(error.message));
  }, [memberId, organizationId, token]);

  useEffect(() => {
    async function loadHistory() {
      if (!token || !organizationId || !member?.login || member?.position !== 'Руководитель логистики') {
        setHistoryItems([]);
        return;
      }

      try {
        const items = await api.getActionHistory(token, organizationId, member.login);
        setHistoryItems(Array.isArray(items) ? items : []);
      } catch (error) {
        setHistoryItems([]);
        setHistoryMessage(error.message);
      }
    }

    loadHistory();
  }, [member?.login, member?.position, organizationId, token]);

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Details сотрудника"
      user={user}
      organizationId={sessionOrganizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      actions={user?.role !== 'EMPLOYEE' ? (
        <Button component={Link} to={`/organizations/${organizationId}/members/${memberId}/edit`} variant="contained" startIcon={<EditIcon />}>
          Редактировать
        </Button>
      ) : null}
    >
      <Stack spacing={3}>
        <Typography variant="h4">Сотрудник</Typography>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography>Логин: {member?.login || '-'}</Typography>
              <Typography>ФИО: {member?.fullName || '-'}</Typography>
              <Typography>Email: {member?.email || '-'}</Typography>
              <Typography>Должность: {member?.position || '-'}</Typography>
              <Typography>Роль: {getRoleLabel(member?.role)}</Typography>
            </Stack>
          </CardContent>
        </Card>

        {member?.position === 'Руководитель логистики' ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">История действий</Typography>
                <ActionHistoryList
                  items={historyItems}
                  organizationId={organizationId}
                  currentUserRole={user?.role}
                  onRevert={async (historyId) => {
                    try {
                      await api.revertActionHistory(token, organizationId, historyId);
                      const items = await api.getActionHistory(token, organizationId, member.login);
                      setHistoryItems(Array.isArray(items) ? items : []);
                    } catch (error) {
                      setHistoryMessage(error.message);
                      return;
                    }
                    setHistoryMessage('Действие откатили');
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} message={message || ''} />
      <Snackbar open={Boolean(historyMessage)} autoHideDuration={4000} onClose={() => setHistoryMessage(null)} message={historyMessage || ''} />
    </AppLayout>
  );
}
