import { useCallback, useEffect, useState } from 'react';
import { fetchBounds, fetchCountryStats, fetchVisits } from '../api/visits';

export function useVisitsData(refreshInterval = 5000) {
  const [visits, setVisits] = useState([]);
  const [countryStats, setCountryStats] = useState([]);
  const [bounds, setBounds] = useState({ min_time: null, max_time: null, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [visitData, stats, timeBounds] = await Promise.all([
        fetchVisits(),
        fetchCountryStats(),
        fetchBounds(),
      ]);

      setVisits(visitData);
      setCountryStats(stats);
      setBounds(timeBounds);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadData, refreshInterval]);

  return { visits, countryStats, bounds, loading, error, refresh: loadData };
}

export function useTimeTravel(visits, cutoffTime) {
  if (!cutoffTime) {
    return visits;
  }

  return visits.filter((visit) => new Date(visit.visited_at) <= new Date(cutoffTime));
}
