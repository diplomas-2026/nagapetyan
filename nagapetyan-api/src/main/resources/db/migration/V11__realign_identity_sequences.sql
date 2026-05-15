select setval(
    pg_get_serial_sequence('organizations', 'id'),
    coalesce((select max(id) from organizations), 1),
    exists(select 1 from organizations)
);

select setval(
    pg_get_serial_sequence('organization_members', 'id'),
    coalesce((select max(id) from organization_members), 1),
    exists(select 1 from organization_members)
);

select setval(
    pg_get_serial_sequence('logistics_records', 'id'),
    coalesce((select max(id) from logistics_records), 1),
    exists(select 1 from logistics_records)
);

select setval(
    pg_get_serial_sequence('logistics_record_movements', 'id'),
    coalesce((select max(id) from logistics_record_movements), 1),
    exists(select 1 from logistics_record_movements)
);

select setval(
    pg_get_serial_sequence('logistics_action_history', 'id'),
    coalesce((select max(id) from logistics_action_history), 1),
    exists(select 1 from logistics_action_history)
);

select setval(
    pg_get_serial_sequence('system_admins', 'id'),
    coalesce((select max(id) from system_admins), 1),
    exists(select 1 from system_admins)
);
