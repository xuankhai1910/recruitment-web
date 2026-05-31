import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
}

/** Vertical bar chart with hover value labels. */
export function BarChart({ data, height = 200 }: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const H = height;
  const W = 480;
  const padL = 30;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value), 1);
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const bw = innerW / (data.length || 1);
  const barW = Math.min(38, bw * 0.56);
  const ticks = [0, 0.5, 1].map((t) => Math.round(niceMax * t));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      {ticks.map((t, i) => {
        const y = padT + innerH - (t / niceMax) * innerH;
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F1F5F9" />
            <text
              x={padL - 7}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="#94A3B8"
            >
              {t}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / niceMax) * innerH;
        const x = padL + i * bw + (bw - barW) / 2;
        const y = padT + innerH - h;
        return (
          <g
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={5}
              fill={d.color ?? "var(--primary)"}
              opacity={hover === null || hover === i ? 1 : 0.55}
              style={{ transition: "opacity 150ms" }}
            />
            {hover === i && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#0F172A"
              >
                {d.value}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={H - 9}
              textAnchor="middle"
              fontSize={9.5}
              fill="#64748B"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
