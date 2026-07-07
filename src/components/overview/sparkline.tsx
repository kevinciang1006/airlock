/** Tiny inline SVG sparkline (no chart library). */
export function Sparkline({
  values,
  stroke = "var(--accent)",
  fill = "rgba(178,94,9,.10)",
  className,
}: {
  values: number[];
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  const w = 120;
  const h = 34;
  if (values.length < 2) return <svg viewBox={`0 0 ${w} ${h}`} className={className} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${pts.join(" L")}`;
  const area = `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
