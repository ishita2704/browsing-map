const API_BASE = 'http://localhost:3001';
const DASHBOARD_URL = 'http://localhost:5173';

const statusDot = document.getElementById('status-dot');
const visitCountEl = document.getElementById('visit-count');
const backendStatusEl = document.getElementById('backend-status');
const recentList = document.getElementById('recent-list');
const openDashboardBtn = document.getElementById('open-dashboard');
const refreshBtn = document.getElementById('refresh-btn');

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function setBackendOnline(online) {
  statusDot.classList.toggle('online', online);
  statusDot.classList.toggle('offline', !online);
  statusDot.title = online ? 'Backend connected' : 'Backend offline';
  backendStatusEl.textContent = online ? 'Online' : 'Offline';
}

function renderRecentVisits(visits) {
  if (!visits.length) {
    recentList.innerHTML = '<li class="empty">No visits yet. Browse the web to get started.</li>';
    return;
  }

  const recent = [...visits].reverse().slice(0, 5);
  recentList.innerHTML = recent
    .map(
      (visit) => `
        <li>
          <span class="domain">${visit.domain}</span>
          <span class="meta">${[visit.city, visit.country].filter(Boolean).join(', ') || 'Unknown'} · ${formatTime(visit.visited_at)}</span>
        </li>
      `,
    )
    .join('');
}

async function loadData() {
  visitCountEl.textContent = '…';
  recentList.innerHTML = '<li class="empty">Loading…</li>';

  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    if (!healthRes.ok) throw new Error('Health check failed');
    setBackendOnline(true);

    const [visitsRes, boundsRes] = await Promise.all([
      fetch(`${API_BASE}/api/visits`),
      fetch(`${API_BASE}/api/visits/bounds`),
    ]);

    if (!visitsRes.ok || !boundsRes.ok) throw new Error('Failed to fetch visits');

    const visits = await visitsRes.json();
    const bounds = await boundsRes.json();

    visitCountEl.textContent = bounds.total ?? visits.length;
    renderRecentVisits(visits);
  } catch {
    setBackendOnline(false);
    visitCountEl.textContent = '—';
    recentList.innerHTML =
      '<li class="empty">Cannot reach backend. Make sure the API is running on port 3001.</li>';
  }
}

openDashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

refreshBtn.addEventListener('click', loadData);

loadData();
