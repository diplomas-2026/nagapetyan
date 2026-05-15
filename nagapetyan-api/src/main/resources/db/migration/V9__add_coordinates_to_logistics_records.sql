alter table logistics_records
    add column if not exists route_from_latitude numeric(10,6),
    add column if not exists route_from_longitude numeric(10,6),
    add column if not exists route_to_latitude numeric(10,6),
    add column if not exists route_to_longitude numeric(10,6);

update logistics_records
set route_from_latitude = 55.755826,
    route_from_longitude = 37.617300,
    route_to_latitude = 55.796127,
    route_to_longitude = 49.106414
where id = 1;

update logistics_records
set route_from_latitude = 55.755826,
    route_from_longitude = 37.617300,
    route_to_latitude = 53.195873,
    route_to_longitude = 50.100193
where id = 2;

update logistics_records
set route_from_latitude = 55.755826,
    route_from_longitude = 37.617300,
    route_to_latitude = 58.010455,
    route_to_longitude = 56.229443
where id = 3;

update logistics_records
set route_from_latitude = 59.931058,
    route_from_longitude = 30.360909,
    route_to_latitude = 59.223840,
    route_to_longitude = 39.883985
where id = 4;

update logistics_records
set route_from_latitude = 59.931058,
    route_from_longitude = 30.360909,
    route_to_latitude = 64.539911,
    route_to_longitude = 40.515762
where id = 5;

update logistics_records
set route_from_latitude = 53.195873,
    route_from_longitude = 50.100193,
    route_to_latitude = 54.738762,
    route_to_longitude = 55.972058
where id = 6;

update logistics_records
set route_from_latitude = 53.195873,
    route_from_longitude = 50.100193,
    route_to_latitude = 51.768199,
    route_to_longitude = 55.096955
where id = 7;

update logistics_records
set route_from_latitude = 53.195873,
    route_from_longitude = 50.100193,
    route_to_latitude = 51.533557,
    route_to_longitude = 46.034257
where id = 8;
