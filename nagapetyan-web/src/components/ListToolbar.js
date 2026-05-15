import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

export function ListToolbar({
  searchLabel,
  searchValue,
  onSearchChange,
  sortLabel,
  sortValue,
  onSortChange,
  sortOptions = [],
  filterLabel,
  filterValue,
  onFilterChange,
  filterOptions = [],
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} useFlexGap>
      <TextField
        fullWidth
        label={searchLabel}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {sortOptions.length ? (
        <FormControl fullWidth>
          <InputLabel>{sortLabel}</InputLabel>
          <Select value={sortValue} label={sortLabel} onChange={(event) => onSortChange(event.target.value)}>
            {sortOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
      {filterOptions.length ? (
        <FormControl fullWidth>
          <InputLabel>{filterLabel}</InputLabel>
          <Select value={filterValue} label={filterLabel} onChange={(event) => onFilterChange(event.target.value)}>
            {filterOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </Stack>
  );
}
