import { useMemo, useState } from 'react';
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ListToolbar } from './ListToolbar';
import { getActionTypeLabel } from '../utils/labels';
import { formatDateTime } from '../utils/formatters';
import { matchesSearch } from '../utils/listFilters';

export function ActionHistoryList({ items, organizationId, currentUserRole, onRevert }) {
  const [search, setSearch] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [filterValue, setFilterValue] = useState('all');

  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => (filterValue === 'all' ? true : item.actionType === filterValue))
        .filter((item) => matchesSearch([item.summary, item.recordShipmentNumber, item.actorFullName, item.actorLogin], search))
        .sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return sortValue === 'oldest' ? aTime - bTime : bTime - aTime;
        }),
    [filterValue, items, search, sortValue],
  );

  return (
    <Stack spacing={2}>
      <ListToolbar
        searchLabel="Поиск по действиям"
        searchValue={search}
        onSearchChange={setSearch}
        sortLabel="Сортировка"
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={[
          { value: 'newest', label: 'Сначала новые' },
          { value: 'oldest', label: 'Сначала старые' },
        ]}
        filterLabel="Тип действия"
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={[
          { value: 'all', label: 'Все действия' },
          { value: 'CREATED', label: getActionTypeLabel('CREATED') },
          { value: 'UPDATED', label: getActionTypeLabel('UPDATED') },
          { value: 'DELETED', label: getActionTypeLabel('DELETED') },
        ]}
      />

      {filteredItems.length ? (
        filteredItems.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={getActionTypeLabel(item.actionType)} />
                  {item.reverted ? <Chip size="small" color="default" label="Откат выполнен" variant="outlined" /> : null}
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(item.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="subtitle1">{item.summary}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.actorFullName} · {item.actorLogin}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button component={Link} to={`/organizations/${organizationId}/reports/${item.recordId}`} reloadDocument size="small" variant="outlined">
                    Перейти к отправлению
                  </Button>
                  {currentUserRole !== 'EMPLOYEE' && item.canRevert ? (
                    <Button size="small" variant="contained" onClick={() => onRevert(item.id)}>
                      Вернуть назад
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" color="text.secondary">
              Ничего не найдено
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
