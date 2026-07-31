function formatTime(isoString) {
  if (!isoString) return '--:--:--';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function TimeTravelSlider({
  visits,
  minTime,
  maxTime,
  currentTime,
  onChange,
  isPlaying,
  onTogglePlay,
}) {
  const minMs = minTime ? new Date(minTime).getTime() : 0;
  const maxMs = maxTime ? new Date(maxTime).getTime() : minMs;
  const currentMs = currentTime ? new Date(currentTime).getTime() : maxMs;
  const progress = maxMs > minMs ? ((currentMs - minMs) / (maxMs - minMs)) * 100 : 100;

  const activeVisit = [...visits]
    .reverse()
    .find((v) => new Date(v.visited_at) <= new Date(currentMs));

  return (
    <section className="panel time-travel-panel">
      <header className="time-travel-header">
        <div>
          <h2>Time Travel</h2>
          <p>Replay your browsing path through the day</p>
        </div>
        <button type="button" className="play-button" onClick={onTogglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </header>

      <input
        type="range"
        min={minMs}
        max={maxMs || minMs + 1}
        value={currentMs}
        onChange={(e) => onChange(new Date(Number(e.target.value)).toISOString())}
        className="time-slider"
        disabled={!minTime || !maxTime || minMs === maxMs}
      />

      <div className="time-travel-meta">
        <span>{formatTime(minTime)}</span>
        <span className="current-time">{formatTime(currentTime)}</span>
        <span>{formatTime(maxTime)}</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {activeVisit && (
        <div className="active-visit">
          <span className="active-label">Now visiting</span>
          <strong>{activeVisit.domain}</strong>
          <span className="active-location">
            {[activeVisit.city, activeVisit.country].filter(Boolean).join(', ') || 'Unknown location'}
          </span>
        </div>
      )}
    </section>
  );
}
