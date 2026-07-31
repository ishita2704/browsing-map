const CONFIG = {
  API_URL: 'http://localhost:3001/api/visits',
  API_KEY: 'ishita-browsing-map-2026',
};
//capture the url and send it to the server post req send 
const recentUrls = new Map();
const DEDUP_WINDOW_MS = 3000;

function shouldSkipUrl(url) {
  if (!url) return true;

  try { //parse the url and check if it is a valid url
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return true;
    if (parsed.hostname === 'chrome.google.com') return true;
    if (parsed.hostname.endsWith('chrome-extension')) return true;
  } catch {
    return true;
  }

  const lastSent = recentUrls.get(url); //check if the url has been sent recently
  const now = Date.now();
  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) { 
    return true; 
  }

  recentUrls.set(url, now);
  return false;
}
//send the url to the server post req send 
async function sendVisit(url, visitedAt) {
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST', 
      headers: { //headers for the post request
        'Content-Type': 'application/json', 
        'X-API-Key': CONFIG.API_KEY,
      },
      body: JSON.stringify({ url, visitedAt }),
    });

    if (!response.ok) { //if the response is not ok= log the error
      const error = await response.text();
      console.warn('[Browsing Map] Failed to record visit:', response.status, error);
    }
  } catch (error) {
    console.warn('[Browsing Map] Network error while recording visit:', error.message);
  }
}

function recordVisit(url) {
  if (shouldSkipUrl(url)) return;
  sendVisit(url, new Date().toISOString());
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) { //if the tab is complete and has a url= record the visit
    recordVisit(tab.url);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) { 
    recordVisit(details.url);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Browsing Map] Extension installed. Capturing page visits.');
});
