import { Router } from 'express';
import { insertVisit, getAllVisits, getCountryStats, getVisitBounds } from '../db/index.js';
import { extractDomain, resolveDomainToIp } from '../services/dns.js';
import { resolveGeoLocation } from '../services/geo.js';
import { requireApiKey } from '../middleware/auth.js';

const router = Router();

router.post('/', requireApiKey, async (req, res) => { 
  try {
    const { url, visitedAt } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }

    const domain = extractDomain(url);
    if (!domain) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const timestamp = visitedAt || new Date().toISOString();
    const { ip, status: dnsStatus } = await resolveDomainToIp(domain);
    const geo = resolveGeoLocation({ domain, ip, dnsStatus });

    const visit = insertVisit({
      url,
      domain,
      ip,
      latitude: geo.latitude,
      longitude: geo.longitude,
      country: geo.country,
      country_code: geo.country_code,
      city: geo.city,
      geo_status: geo.geo_status,
      visited_at: timestamp,
    });

    res.status(201).json(visit); //201=new resp created

  } catch (error) {
    console.error('Failed to record visit:', error);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

router.get('/', (_req, res) => { //Returns all plottable visits for map visualization.
  try {
    const { start, end } = _req.query;
    const visits = getAllVisits({ start, end }); 
    res.json(visits);
  } catch (error) {
    console.error('Failed to fetch visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

router.get('/stats/countries', (_req, res) => { //Returns country-level stats for visualization.heatmap
  try {
    const { start, end } = _req.query;
    const stats = getCountryStats({ start, end });
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch country stats:', error);
    res.status(500).json({ error: 'Failed to fetch country stats' });
  }
});

router.get('/bounds', (_req, res) => { //Returns the min and max time and total visits for slider 
  try { 
    const bounds = getVisitBounds();
    res.json(bounds);
  } catch (error) {
    console.error('Failed to fetch bounds:', error);
    res.status(500).json({ error: 'Failed to fetch bounds' });
  }
});

export default router;
