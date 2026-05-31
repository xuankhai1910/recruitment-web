export interface HBarDatum {
  label: string;
  value: number;
  color?: string;
}

interface HBarsProps {
  data: HBarDatum[];
  max?: number;
}

/** Horizontal labelled bars (role / module distributions). */
export function HBars({ data, max }: HBarsProps) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1.5 flex justify-between text-[12.5px]">
            <span className="font-medium text-muted-foreground">{d.label}</span>
            <span className="font-bold tabular-nums">{d.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.value / m) * 100}%`,
                background: d.color ?? "var(--primary)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
