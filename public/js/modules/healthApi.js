import { apiFetch } from '../api.js';

export function fetchHealthDashboard(options = {}) {
  const params = new URLSearchParams();

  if (options.date) {
    params.set('date', options.date);
  }

  if (options.endDate) {
    params.set('endDate', options.endDate);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/api/health${suffix}`);
}

export function saveDailyLog(payload) {
  return apiFetch('/api/health', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
