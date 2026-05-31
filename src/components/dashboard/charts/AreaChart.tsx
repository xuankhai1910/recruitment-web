import { useState } from "react";

export interface AreaSeries {
  label: string;
  values: number[];
  color: string;
}

interface AreaChartProps {
  series: AreaSeries[];
  labels: string[];
  height?: number;
}

/** Multi-series area/line chart with a hover crosshair + tooltip. */
export function AreaChart({ series, labels, height = 220 }: AreaChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const padL = 34;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const n = labels.length;
  const step = innerW / (n - 1 || 1);
  const xOf = (i: number) => padL + i * step;
  const yOf = (v: number) => padT + innerH - (v / niceMax) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        {ticks.map((t, i) => (
          <g key={`g${i}`}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="#F1F5F9"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={yOf(t) + 3}
              textAnchor="end"
              fontSize={10}
              fill="#94A3B8"
            >
              {t}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          n > 10 && i % 2 !== 0 ? null : (
            <text
              key={`x${i}`}
              x={xOf(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={9.5}
              fill="#94A3B8"
            >
              {l}
            </text>
          ),
        )}
        {series.map((s, si) => {
          const pts = s.values.map(
            (v, i): [number, number] => [xOf(i), yOf(v)],
          );
          const d = pts
            .map(
              (p, i) =>
                `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`,
            )
            .join(" ");
          const area = `${d} L${xOf(n - 1)} ${padT + innerH} L${padL} ${padT + innerH} Z`;
          return (
            <g key={`s${si}`}>
              {si === 0 && <path d={area} fill={s.color} opacity={0.1} />}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={hover === i ? 4 : 0}
                  fill="#fff"
                  stroke={s.color}
                  strokeWidth={2}
                />
              ))}
            </g>
          );
        })}
        {labels.map((_, i) => (
          <rect
            key={`h${i}`}
            x={xOf(i) - step / 2}
            y={padT}
            width={step}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {hover !== null && (
          <line
            x1={xOf(hover)}
            x2={xOf(hover)}
            y1={padT}
            y2={padT + innerH}
            stroke="#CBD5E1"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -ml-7 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg"
          style={{ left: `${(xOf(hover) / W) * 100}%` }}
        >
          <div className="mb-0.5 font-semibold">{labels[hover]}</div>
          {series.map((s, si) => (
            <div key={si} className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-[2px]"
                style={{ background: s.color }}
              />
              <span>
                {s.label}: {s.values[hover]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
