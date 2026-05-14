import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import { AppLayout } from '../components/AppLayout';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';

export function OrganizationsPage() {
  const navigate = useNavigate();
  const { role, setRole, organizationId, setOrganizationId, clearSession } = useSession();
  const { organizations } = useOrganizations(role, organizationId);
  const canEditOrganizations = role === 'SYSTEM_ADMIN';

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      navigate(`/organizations/${nextOrganizationId}`);
    }
  }

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Список организаций"
      role={role}
      organizationId={organizationId}
      organizations={organizations}
      onRoleChange={setRole}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      actions={canEditOrganizations ? <Button startIcon={<AddIcon />} component={Link} to="/organizations/new" variant="contained">Добавить организацию</Button> : null}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="h4">Организации</Typography>
            <Typography variant="body1" color="text.secondary">
              Кликните по строке, чтобы открыть details.
            </Typography>
          </Box>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((item) => (
              <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/organizations/${item.id}`)}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.inn}</TableCell>
                <TableCell>{item.region}</TableCell>
                <TableCell>{item.ownersCount}</TableCell>
                <TableCell>{item.employeesCount}</TableCell>
                <TableCell>{item.reportsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </AppLayout>
  );
}
