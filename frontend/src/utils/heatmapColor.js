const HEAT_STOPS = [
  { t: 0, rgb: [36, 48, 68] },
  { t: 0.2, rgb: [30, 64, 175] },
  { t: 0.45, rgb: [14, 165, 233] },
  { t: 0.7, rgb: [250, 204, 21] },
  { t: 1, rgb: [239, 68, 68] },
];

const BASE_COLOR = '#243044';

function interpolateColor(t) {
  const clamped = Math.max(0, Math.min(t, 1));

  for (let i = 0; i < HEAT_STOPS.length - 1; i += 1) {
    const left = HEAT_STOPS[i];
    const right = HEAT_STOPS[i + 1];

    if (clamped >= left.t && clamped <= right.t) {
      const span = right.t - left.t || 1;
      const localT = (clamped - left.t) / span;
      const r = Math.round(left.rgb[0] + (right.rgb[0] - left.rgb[0]) * localT);
      const g = Math.round(left.rgb[1] + (right.rgb[1] - left.rgb[1]) * localT);
      const b = Math.round(left.rgb[2] + (right.rgb[2] - left.rgb[2]) * localT);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  const last = HEAT_STOPS[HEAT_STOPS.length - 1].rgb;
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

export function getHeatmapColor(count, maxCount) {
  if (!count || maxCount <= 0) {
    return BASE_COLOR;
  }

  return interpolateColor(count / maxCount);
}

export function brightenColor(color, amount = 0.15) {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;

  const r = Math.min(255, Math.round(Number(match[1]) + 255 * amount));
  const g = Math.min(255, Math.round(Number(match[2]) + 255 * amount));
  const b = Math.min(255, Math.round(Number(match[3]) + 255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

export { BASE_COLOR, HEAT_STOPS };
