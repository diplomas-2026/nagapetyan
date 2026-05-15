import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Chip, Snackbar, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { ActionHistoryList } from '../components/ActionHistoryList';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { getRoleLabel } from '../utils/labels';

function buildInitials(fullName) {
  if (!fullName) {
    return '??';
  }

  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

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

  const memberCards = useMemo(
    () => [
      { label: 'Логин', value: member?.login || '-' },
      { label: 'Email', value: member?.email || '-' },
      { label: 'Должность', value: member?.position || '-' },
      { label: 'Роль', value: getRoleLabel(member?.role) },
    ],
    [member],
  );

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
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #dbeafe 100%)',
            color: '#fff',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }}>
                {buildInitials(member?.fullName)}
              </Avatar>
              <Stack spacing={0.75}>
                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.2 }}>
                  Сотрудник организации
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {member?.fullName || 'Сотрудник'}
                </Typography>
                <Typography sx={{ opacity: 0.88 }}>
                  {member?.position || 'Должность не указана'}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={getRoleLabel(member?.role)} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
              {member?.position === 'Руководитель логистики' ? (
                <Chip label="Есть доступ к истории действий" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
              ) : null}
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {memberCards.map((item) => (
            <Card key={item.label} variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6">{item.value}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <Typography variant="h6">Профиль</Typography>
              <Typography color="text.secondary">
                Здесь показаны основные сведения о сотруднике и его полномочиях в организации.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {member?.position === 'Руководитель логистики' ? (
          <Card variant="outlined">
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
