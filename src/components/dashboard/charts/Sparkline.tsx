interface SparklineProps {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}

/** Tiny KPI trend line with a soft area fill (no axes). */
export function Sparkline({
  values,
  color,
  width = 76,
  height = 30,
}: SparklineProps) {
  if (!values.length) return null;
  const pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1 || 1);
  const pts = values.map(
    (v, i): [number, number] => [
      pad + i * step,
      height - pad - ((v - min) / span) * (height - pad * 2),
    ],
  );
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0].toFixed(1)} ${height - pad} L${pad} ${height - pad} Z`;
  return (
    <svg width={width} height={height} className="shrink-0">
      <path d={area} fill={color} opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} />
    </svg>
  );
}
