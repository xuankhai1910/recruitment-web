export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerValue: number | string;
  centerLabel: string;
}

/** Ring chart with a centered total. Flat segments, no gradients. */
export function DonutChart({
  data,
  size = 168,
  thickness = 22,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const circ = 2 * Math.PI * r;
  // Precompute each segment's length + starting offset (no mutation in render).
  const segments = data.reduce<
    { datum: DonutDatum; len: number; offset: number }[]
  >((acc, datum) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.len : 0;
    acc.push({ datum, len: (datum.value / total) * circ, offset });
    return acc;
  }, []);
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.datum.color}
            strokeWidth={thickness}
            strokeDasharray={`${seg.len} ${circ - seg.len}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tracking-tight tabular-nums">
          {centerValue}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {centerLabel}
        </div>
      </div>
    </div>
  );
}
