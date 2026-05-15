export function buildPointUrl(organizationId, { kind, name, latitude, longitude }) {
  const params = new URLSearchParams();
  if (kind) {
    params.set('kind', kind);
  }
  if (name) {
    params.set('name', name);
  }
  if (latitude !== undefined && latitude !== null && latitude !== '') {
    params.set('lat', String(latitude));
  }
  if (longitude !== undefined && longitude !== null && longitude !== '') {
    params.set('lng', String(longitude));
  }
  return `/organizations/${organizationId}/points?${params.toString()}`;
}

export function formatCoordinate(value) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(6) : String(value);
}
