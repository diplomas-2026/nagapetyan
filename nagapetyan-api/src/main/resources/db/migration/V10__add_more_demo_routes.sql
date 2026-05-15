insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 9, 1, 'RT-1004', 'Москва', 55.755826, 37.617300, 'Нижний Новгород', 56.296503, 43.936059,
       current_date - 8, current_date - 5, current_date - 5, 'DELIVERED', 'Центральный сортировочный центр',
       'Дополнительный рейс по Поволжью', 1.450, 265.00
where not exists (select 1 from logistics_records where id = 9);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 10, 1, 'RT-1005', 'Москва', 55.755826, 37.617300, 'Екатеринбург', 56.838011, 60.597465,
       current_date - 7, current_date - 4, current_date - 3, 'DELIVERED', 'Центральный сортировочный центр',
       'Успешная доставка на Урал', 2.180, 430.00
where not exists (select 1 from logistics_records where id = 10);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 11, 1, 'RT-1006', 'Москва', 55.755826, 37.617300, 'Ростов-на-Дону', 47.235713, 39.701505,
       current_date - 6, current_date - 3, current_date - 2, 'DELAYED', 'Центральный сортировочный центр',
       'Позднее прибытие на один день', 1.920, 355.00
where not exists (select 1 from logistics_records where id = 11);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 12, 1, 'RT-1007', 'Москва', 55.755826, 37.617300, 'Краснодар', 45.035470, 38.975313,
       current_date - 5, current_date - 2, null, 'IN_TRANSIT', 'Центральный сортировочный центр',
       'В пути на южное направление', 0.780, 210.00
where not exists (select 1 from logistics_records where id = 12);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 13, 1, 'RT-1008', 'Казань', 55.796127, 49.106414, 'Москва', 55.755826, 37.617300,
       current_date - 4, current_date - 1, current_date - 1, 'DELIVERED', 'Центральный сортировочный центр',
       'Обратный рейс из региона', 1.340, 240.00
where not exists (select 1 from logistics_records where id = 13);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 14, 1, 'RT-1009', 'Самара', 53.195873, 50.100193, 'Москва', 55.755826, 37.617300,
       current_date - 9, current_date - 6, current_date - 6, 'DELIVERED', 'Центральный сортировочный центр',
       'Регулярная поставка', 3.210, 510.00
where not exists (select 1 from logistics_records where id = 14);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 15, 1, 'RT-1010', 'Пермь', 58.010455, 56.229443, 'Москва', 55.755826, 37.617300,
       current_date - 3, current_date - 1, null, 'IN_TRANSIT', 'Центральный сортировочный центр',
       'Сборная доставка из региона', 2.750, 390.00
where not exists (select 1 from logistics_records where id = 15);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 16, 1, 'RT-1011', 'Воронеж', 51.660781, 39.200296, 'Самара', 53.195873, 50.100193,
       current_date - 11, current_date - 8, current_date - 7, 'DELIVERED', 'Центральный сортировочный центр',
       'Стабильная межрегиональная связь', 1.050, 220.00
where not exists (select 1 from logistics_records where id = 16);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 17, 1, 'RT-1012', 'Тула', 54.192122, 37.615560, 'Казань', 55.796127, 49.106414,
       current_date - 10, current_date - 7, current_date - 6, 'DELAYED', 'Центральный сортировочный центр',
       'Потребовалась дополнительная сортировка', 0.940, 180.00
where not exists (select 1 from logistics_records where id = 17);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 18, 1, 'RT-1013', 'Рязань', 54.629567, 39.744268, 'Екатеринбург', 56.838011, 60.597465,
       current_date - 12, current_date - 9, current_date - 8, 'DELIVERED', 'Центральный сортировочный центр',
       'Маршрут на восток', 1.670, 335.00
where not exists (select 1 from logistics_records where id = 18);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 19, 1, 'RT-1014', 'Нижний Новгород', 56.296503, 43.936059, 'Ростов-на-Дону', 47.235713, 39.701505,
       current_date - 2, current_date + 1, null, 'IN_TRANSIT', 'Центральный сортировочный центр',
       'Крупная посылка на юг', 4.100, 760.00
where not exists (select 1 from logistics_records where id = 19);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 20, 1, 'RT-1015', 'Екатеринбург', 56.838011, 60.597465, 'Краснодар', 45.035470, 38.975313,
       current_date - 1, current_date + 2, null, 'IN_TRANSIT', 'Центральный сортировочный центр',
       'Новый маршрут для демонстрации', 2.340, 440.00
where not exists (select 1 from logistics_records where id = 20);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 21, 1, 'RT-1016', 'Краснодар', 45.035470, 38.975313, 'Москва', 55.755826, 37.617300,
       current_date - 14, current_date - 11, current_date - 11, 'DELIVERED', 'Центральный сортировочный центр',
       'Сезонный маршрут', 1.120, 255.00
where not exists (select 1 from logistics_records where id = 21);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 22, 1, 'RT-1017', 'Самара', 53.195873, 50.100193, 'Нижний Новгород', 56.296503, 43.936059,
       current_date - 5, current_date - 2, current_date - 1, 'DELAYED', 'Центральный сортировочный центр',
       'Дополнительная сортировка на хабе', 1.880, 315.00
where not exists (select 1 from logistics_records where id = 22);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 23, 1, 'RT-1018', 'Казань', 55.796127, 49.106414, 'Пермь', 58.010455, 56.229443,
       current_date - 8, current_date - 6, current_date - 5, 'DELIVERED', 'Центральный сортировочный центр',
       'Рейс в соседний регион', 0.970, 195.00
where not exists (select 1 from logistics_records where id = 23);

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_from_latitude, route_from_longitude,
    route_to, route_to_latitude, route_to_longitude, shipped_at, planned_delivery_date, delivered_at,
    status, responsible_department, note, weight, cost
)
select 24, 1, 'RT-1019', 'Москва', 55.755826, 37.617300, 'Тула', 54.192122, 37.615560,
       current_date - 2, current_date + 1, null, 'IN_TRANSIT', 'Центральный сортировочный центр',
       'Короткое направление для демонстрации графа', 0.720, 145.00
where not exists (select 1 from logistics_records where id = 24);
