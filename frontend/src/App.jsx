import { useCallback, useEffect, useMemo, useState } from 'react';
import WorldMap from './components/WorldMap';
import HeatmapPanel from './components/HeatmapPanel';
import TimeTravelSlider from './components/TimeTravelSlider';
import { useTimeTravel, useVisitsData } from './hooks/useVisitsData';
import { fetchCountryStats, fetchVisits } from './api/visits';
import './App.css';

export default function App() {
  const { visits, countryStats, bounds, loading, error, refresh } = useVisitsData();
  const [currentTime, setCurrentTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredStats, setFilteredStats] = useState([]);

  const visibleVisits = useTimeTravel(visits, currentTime);

  const activeVisit = useMemo(() => {
    if (visibleVisits.length === 0) return null;
    return visibleVisits[visibleVisits.length - 1];
  }, [visibleVisits]);

  useEffect(() => {
    if (bounds.max_time && !currentTime) {
      setCurrentTime(bounds.max_time);
    }
  }, [bounds.max_time, currentTime]);

  useEffect(() => {
    if (!currentTime) return;

    const loadFilteredStats = async () => {
      try {
        const stats = await fetchCountryStats({ end: currentTime });
        setFilteredStats(stats);
      } catch {
        setFilteredStats(countryStats);
      }
    };

    loadFilteredStats();
  }, [currentTime, countryStats]);

  useEffect(() => {
    if (!isPlaying || !bounds.min_time || !bounds.max_time) return;

    const minMs = new Date(bounds.min_time).getTime();
    const maxMs = new Date(bounds.max_time).getTime();
    const duration = Math.max(maxMs - minMs, 1);
    const stepMs = Math.max(Math.floor(duration / 200), 250);

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const prevMs = prev ? new Date(prev).getTime() : minMs;
        const nextMs = prevMs + stepMs;
        if (nextMs >= maxMs) {
          setIsPlaying(false);
          return bounds.max_time;
        }
        return new Date(nextMs).toISOString();
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, bounds.min_time, bounds.max_time]);

  const handleTogglePlay = useCallback(() => {
    if (!bounds.min_time) return;

    setIsPlaying((playing) => {
      if (!playing) {
        setCurrentTime(bounds.min_time);
      }
      return !playing;
    });
  }, [bounds.min_time]);

  const handleSeedDemo = async () => {
    const demoUrls = [
      
      { url: 'https://github.com/explore', offset: 120000 }
  
    ];

    const baseTime = Date.now();

    await Promise.all(
      demoUrls.map(({ url, offset }) =>
        fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'ishita-browsing-map-2026',
          },
          body: JSON.stringify({
            url,
            visitedAt: new Date(baseTime + offset).toISOString(),
          }),
        }),
      ),
    );

    await refresh();
    const updated = await fetchVisits();
    if (updated.length > 0) {
      setCurrentTime(updated[updated.length - 1].visited_at);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Browsing Map</h1>
        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={refresh}>
            Refresh
          </button>
          <button type="button" className="primary-button" onClick={handleSeedDemo}>
            Load demo data
          </button>
        </div>
      </header>

      {loading && <div className="status-banner">Loading visit data…</div>}
      {error && <div className="status-banner error">{error}</div>}

      <main className="layout">
        <section className="map-panel panel">
          <WorldMap
            visits={visibleVisits}
            activeVisitId={activeVisit?.id}
            countryStats={filteredStats.length ? filteredStats : countryStats}
          />
        </section>

        <aside className="sidebar">
          <HeatmapPanel stats={filteredStats.length ? filteredStats : countryStats} />
          <TimeTravelSlider
            visits={visibleVisits}
            minTime={bounds.min_time}
            maxTime={bounds.max_time}
            currentTime={currentTime}
            onChange={setCurrentTime}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
          <section className="panel visit-list-panel">
            <header>
              <h2>Recent path</h2>
              <p>{visibleVisits.length} plotted stops</p>
            </header>
            <ul className="visit-list">
              {[...visibleVisits].reverse().slice(0, 8).map((visit) => (
                <li key={visit.id} className={visit.id === activeVisit?.id ? 'active' : ''}>
                  <strong>{visit.domain}</strong>
                  <span>{new Date(visit.visited_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
