alter table logistics_records
    add column if not exists weight numeric(12,3),
    add column if not exists cost numeric(14,2);

update logistics_records
set weight = 1.000,
    cost = 250.00
where id = 1 and weight is null and cost is null;

update logistics_records
set weight = 2.400,
    cost = 320.00
where id = 2 and weight is null and cost is null;

update logistics_records
set weight = 0.850,
    cost = 180.00
where id = 3 and weight is null and cost is null;

update logistics_records
set weight = 1.100,
    cost = 210.00
where id = 4 and weight is null and cost is null;

update logistics_records
set weight = 3.250,
    cost = 410.00
where id = 5 and weight is null and cost is null;

update logistics_records
set weight = 0.600,
    cost = 150.00
where id = 6 and weight is null and cost is null;

update logistics_records
set weight = 1.800,
    cost = 275.00
where id = 7 and weight is null and cost is null;

update logistics_records
set weight = 2.100,
    cost = 390.00
where id = 8 and weight is null and cost is null;

update logistics_records
set weight = coalesce(weight, 1.000),
    cost = coalesce(cost, 100.00)
where weight is null or cost is null;

alter table logistics_records
    alter column weight set not null,
    alter column cost set not null;
