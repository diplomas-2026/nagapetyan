const ROLE_LABELS = {
  SYSTEM_ADMIN: 'Администратор системы',
  OWNER: 'Владелец',
  EMPLOYEE: 'Сотрудник',
};

const REPORT_STATUS_LABELS = {
  IN_TRANSIT: 'В пути',
  DELIVERED: 'Доставлено',
  DELAYED: 'С задержкой',
  CANCELED: 'Отменено',
};

const ACTION_TYPE_LABELS = {
  CREATED: 'Создано',
  UPDATED: 'Обновлено',
  DELETED: 'Удалено',
};

const MOVEMENT_TYPE_LABELS = {
  CREATED: 'Создано',
  ACCEPTED: 'Принято',
  IN_TRANSIT: 'В пути',
  DELIVERED: 'Доставлено',
  DELAYED: 'С задержкой',
  CANCELED: 'Отменено',
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || '-';
}

export function getReportStatusLabel(status) {
  return REPORT_STATUS_LABELS[status] || status || '-';
}

export function getActionTypeLabel(actionType) {
  return ACTION_TYPE_LABELS[actionType] || actionType || '-';
}

export function getMovementTypeLabel(movementType) {
  return MOVEMENT_TYPE_LABELS[movementType] || movementType || '-';
}
