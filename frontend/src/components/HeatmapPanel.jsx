import { getHeatmapColor } from '../utils/heatmapColor';

const MAX_BAR_WIDTH = 100;

export default function HeatmapPanel({ stats }) {
  const maxCount = stats[0]?.count || 1;

  if (stats.length === 0) {
    return (
      <section className="panel heatmap-panel">
        <header>
          <h2>Country Heatmap</h2>
          <p>Visit frequency by server origin country</p>
        </header>
        <div className="empty-state">No geo-resolved visits yet. Browse the web with the extension installed.</div>
      </section>
    );
  }

  return (
    <section className="panel heatmap-panel">
      <header>
        <h2>Country Heatmap</h2>
        <p>Visit frequency by server origin country</p>
      </header>
      <ul className="heatmap-list">
        {stats.map((entry) => {
          const width = Math.round((entry.count / maxCount) * MAX_BAR_WIDTH);
          const color = getHeatmapColor(entry.count, maxCount);
          return (
            <li key={entry.country_code} className="heatmap-row">
              <div className="heatmap-label">
                <span className="country-code">{entry.country_code}</span>
                <span className="country-name">{entry.country}</span>
              </div>
              <div className="heatmap-bar-track">
                <div
                  className="heatmap-bar-fill"
                  style={{ width: `${width}%`, background: color }}
                  title={`${entry.count} visits`}
                />
              </div>
              <span className="heatmap-count">{entry.count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
