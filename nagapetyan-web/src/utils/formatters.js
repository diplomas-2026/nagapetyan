export function formatWeight(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 }).format(number)} кг`;
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
