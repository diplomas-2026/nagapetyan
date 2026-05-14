insert into organizations (id, name, inn, region, description)
values
    (1, 'АО «Почта России» - Центральный филиал', '7700000000', 'Москва', 'Демонстрационная организация для логистической отчетности'),
    (2, 'АО «Почта России» - Северный филиал', '7800000000', 'Санкт-Петербург', 'Организация для показа нескольких владельцев и сотрудников'),
    (3, 'АО «Почта России» - Приволжский филиал', '6300000000', 'Самара', 'Дополнительная организация для выборки и отчётов');

insert into organization_members (id, organization_id, full_name, email, position, role)
values
    (1, 1, 'Иван Петров', 'ivan.petrov@mail.ru', 'Руководитель логистики', 'OWNER'),
    (2, 1, 'Анна Смирнова', 'anna.smirnova@mail.ru', 'Аналитик', 'EMPLOYEE'),
    (3, 1, 'Мария Кузнецова', 'maria.kuznetsova@mail.ru', 'Старший специалист', 'OWNER'),
    (4, 2, 'Олег Иванов', 'oleg.ivanov@mail.ru', 'Руководитель филиала', 'OWNER'),
    (5, 2, 'Елена Соколова', 'elena.sokolova@mail.ru', 'Логист', 'EMPLOYEE'),
    (6, 3, 'Дмитрий Орлов', 'dmitry.orlov@mail.ru', 'Владелец филиала', 'OWNER'),
    (7, 3, 'Татьяна Федорова', 'tatiana.fedorova@mail.ru', 'Сотрудник отдела отчетности', 'EMPLOYEE');

insert into logistics_records (
    id, organization_id, shipment_number, route_from, route_to, shipped_at,
    planned_delivery_date, delivered_at, status, responsible_department, note
)
values
    (1, 1, 'RT-1001', 'Москва', 'Казань', current_date - 5, current_date - 2, current_date - 2, 'DELIVERED', 'Центральный сортировочный центр', 'Доставлено без отклонений'),
    (2, 1, 'RT-1002', 'Москва', 'Самара', current_date - 4, current_date - 1, current_date + 1, 'DELAYED', 'Центральный сортировочный центр', 'Есть риск нарушения срока'),
    (3, 1, 'RT-1003', 'Москва', 'Пермь', current_date - 3, current_date - 1, null, 'IN_TRANSIT', 'Центральный сортировочный центр', 'В пути'),
    (4, 2, 'RT-2001', 'Санкт-Петербург', 'Вологда', current_date - 2, current_date - 1, current_date - 1, 'DELIVERED', 'Северный логистический узел', 'Доставлено в срок'),
    (5, 2, 'RT-2002', 'Санкт-Петербург', 'Архангельск', current_date - 6, current_date - 3, current_date - 1, 'DELAYED', 'Северный логистический узел', 'Задержка из-за транспорта'),
    (6, 3, 'RT-3001', 'Самара', 'Уфа', current_date - 2, current_date - 1, current_date - 1, 'DELIVERED', 'Приволжский логистический центр', 'Завершено успешно'),
    (7, 3, 'RT-3002', 'Самара', 'Оренбург', current_date - 1, current_date + 1, null, 'IN_TRANSIT', 'Приволжский логистический центр', 'В обработке'),
    (8, 3, 'RT-3003', 'Самара', 'Саратов', current_date - 7, current_date - 4, current_date - 2, 'DELAYED', 'Приволжский логистический центр', 'Требует анализа');
