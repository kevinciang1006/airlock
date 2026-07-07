/** Inline SVG area/line chart with baseline gridlines (no chart library). */
export function AreaChart({ values }: { values: number[] }) {
  const w = 620;
  const h = 200;
  if (values.length < 2) return <svg viewBox={`0 0 ${w} ${h}`} className="h-[200px] w-full" />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 24) - 12;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${pts.join(" L")}`;
  const area = `M0,${h} L${pts.join(" L")} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[200px] w-full">
      {[50, 100, 150].map((y) => (
        <line key={y} x1={0} y1={y} x2={w} y2={y} stroke="var(--bg-track)" />
      ))}
      <path d={area} fill="rgba(178,94,9,.08)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
