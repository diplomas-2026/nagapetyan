import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import { AppLayout } from '../components/AppLayout';
import { ListToolbar } from '../components/ListToolbar';
import { useSession } from '../hooks/useSession';
import { useOrganizations } from '../hooks/useOrganizations';
import { matchesSearch } from '../utils/listFilters';

export function OrganizationsPage() {
  const navigate = useNavigate();
  const { token, user, organizationId, setOrganizationId, clearSession } = useSession();
  const { organizations, loading } = useOrganizations(token);
  const canEditOrganizations = user?.role === 'SYSTEM_ADMIN';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [regionFilter, setRegionFilter] = useState('all');

  function handleOrganizationChange(nextOrganizationId) {
    setOrganizationId(nextOrganizationId);
    if (nextOrganizationId) {
      window.location.assign(`/organizations/${nextOrganizationId}`);
    }
  }

  function openOrganizationDetails(organizationIdValue) {
    window.location.assign(`/organizations/${organizationIdValue}`);
  }

  const regionOptions = useMemo(() => {
    const values = new Set(organizations.map((item) => item.region).filter(Boolean));
    return ['all', ...values];
  }, [organizations]);

  const filteredOrganizations = organizations
    .filter((item) => (regionFilter === 'all' ? true : item.region === regionFilter))
    .filter((item) => matchesSearch([item.name, item.inn, item.region], search))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return String(b.name || '').localeCompare(String(a.name || ''), 'ru');
        case 'region-asc':
          return String(a.region || '').localeCompare(String(b.region || ''), 'ru');
        case 'region-desc':
          return String(b.region || '').localeCompare(String(a.region || ''), 'ru');
        case 'reports-desc':
          return Number(b.reportsCount || 0) - Number(a.reportsCount || 0);
        case 'reports-asc':
          return Number(a.reportsCount || 0) - Number(b.reportsCount || 0);
        case 'name-asc':
        default:
          return String(a.name || '').localeCompare(String(b.name || ''), 'ru');
      }
    });

  return (
    <AppLayout
      title="Логистика и отчетность"
      subtitle="Список организаций"
      user={user}
      organizationId={organizationId}
      organizations={organizations}
      onOrganizationChange={handleOrganizationChange}
      onLogout={() => {
        clearSession();
        navigate('/login');
      }}
      loading={loading}
      actions={canEditOrganizations ? <Button startIcon={<AddIcon />} component={Link} to="/organizations/new" reloadDocument variant="contained">Добавить организацию</Button> : null}
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

        <ListToolbar
          searchLabel="Поиск"
          searchValue={search}
          onSearchChange={setSearch}
          sortLabel="Сортировка"
          sortValue={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { value: 'name-asc', label: 'Название: по возрастанию' },
            { value: 'name-desc', label: 'Название: по убыванию' },
            { value: 'region-asc', label: 'Регион: по возрастанию' },
            { value: 'region-desc', label: 'Регион: по убыванию' },
            { value: 'reports-asc', label: 'Отправления: по возрастанию' },
            { value: 'reports-desc', label: 'Отправления: по убыванию' },
          ]}
          filterLabel="Регион"
          filterValue={regionFilter}
          onFilterChange={setRegionFilter}
          filterOptions={[{ value: 'all', label: 'Все регионы' }, ...regionOptions.filter((item) => item !== 'all').map((item) => ({ value: item, label: item }))]}
        />

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
            {filteredOrganizations.length ? (
              filteredOrganizations.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setOrganizationId(String(item.id));
                    openOrganizationDetails(item.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setOrganizationId(String(item.id));
                      openOrganizationDetails(item.id);
                    }
                  }}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.inn}</TableCell>
                  <TableCell>{item.region}</TableCell>
                  <TableCell>{item.ownersCount}</TableCell>
                  <TableCell>{item.employeesCount}</TableCell>
                  <TableCell>{item.reportsCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? <CircularProgress size={24} /> : 'Ничего не найдено'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </AppLayout>
  );
}
