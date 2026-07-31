import { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { brightenColor, getHeatmapColor } from '../utils/heatmapColor';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function buildLines(visits) {
  const lines = [];

  for (let i = 1; i < visits.length; i += 1) {
    const prev = visits[i - 1];
    const curr = visits[i];

    if (
      prev.latitude == null ||
      prev.longitude == null ||
      curr.latitude == null ||
      curr.longitude == null
    ) {
      continue;
    }

    lines.push({
      key: `${prev.id}-${curr.id}`,
      from: [prev.longitude, prev.latitude],
      to: [curr.longitude, curr.latitude],
    });
  }

  return lines;
}

function getGeoCountryCode(geo) {
  const code =
    geo.properties.ISO_A2 ||
    geo.properties.iso_a2 ||
    geo.properties.ISO_A2_EH ||
    geo.properties.WB_A2;

  if (!code || code === '-99') {
    return null;
  }

  return code.toUpperCase();
}

export default function WorldMap({ visits, activeVisitId, countryStats = [] }) {
  const points = useMemo(
    () => visits.filter((visit) => visit.latitude != null && visit.longitude != null),
    [visits],
  );

  const lines = useMemo(() => buildLines(visits), [visits]);

  const { countByCountry, maxCount } = useMemo(() => {
    const counts = new Map();

    countryStats.forEach((entry) => {
      if (entry.country_code) {
        counts.set(entry.country_code.toUpperCase(), entry.count);
      }
    });

    const max = countryStats[0]?.count || 0;
    return { countByCountry: counts, maxCount: max };
  }, [countryStats]);

  return (
    <div className="world-map">
      <ComposableMap projection="geoEqualEarth" className="world-map-svg">
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getGeoCountryCode(geo);
                const visitCount = countryCode ? countByCountry.get(countryCode) || 0 : 0;
                const fill = getHeatmapColor(visitCount, maxCount);
                const countryName = geo.properties.name || countryCode || 'Unknown';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#1e293b"
                    strokeWidth={0.35}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: visitCount > 0 ? brightenColor(fill) : '#334155',
                        outline: 'none',
                        cursor: visitCount > 0 ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                  >
                    <title>
                      {visitCount > 0
                        ? `${countryName}: ${visitCount} visit${visitCount === 1 ? '' : 's'}`
                        : countryName}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>

          {lines.map((line) => (
            <Line
              key={line.key}
              from={line.from}
              to={line.to}
              stroke="#64748b"
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}

          {points.map((visit) => {
            const isActive = visit.id === activeVisitId;
            return (
              <Marker key={visit.id} coordinates={[visit.longitude, visit.latitude]}>
                <circle
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? '#f59e0b' : '#ffffff'}
                  stroke="#0f172a"
                  strokeWidth={1}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {maxCount > 0 && (
        <div className="map-legend">
          <span className="map-legend-label">Visit frequency</span>
          <div className="map-legend-bar" />
          <div className="map-legend-scale">
            <span>Low</span>
            <span>{maxCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
