import { Tabs, Tab } from '@mui/material';

export function SectionTabs({ value, onChange }) {
  return (
    <Tabs value={value} onChange={(_, nextValue) => onChange(nextValue)} sx={{ mb: 3 }}>
      <Tab value="overview" label="Обзор" />
      <Tab value="members" label="Сотрудники" />
      <Tab value="reports" label="Отправления" />
    </Tabs>
  );
}
