const API_BASE = '/api/visits';

export async function fetchVisits({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);

  const query = params.toString();
  const response = await fetch(`${API_BASE}${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error('Failed to fetch visits');
  }

  return response.json();
}

export async function fetchCountryStats({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);

  const query = params.toString();
  const response = await fetch(`${API_BASE}/stats/countries${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error('Failed to fetch country stats');
  }

  return response.json();
}

export async function fetchBounds() {
  const response = await fetch(`${API_BASE}/bounds`);

  if (!response.ok) {
    throw new Error('Failed to fetch bounds');
  }

  return response.json();
}
