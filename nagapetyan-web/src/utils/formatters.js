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
