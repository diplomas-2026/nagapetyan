export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .trim();
}

export function matchesSearch(fields, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => normalizeText(field).includes(normalizedQuery));
}
