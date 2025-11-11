const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function buildPath(values: number[], w = 300, h = 120, padding = 12) {
  if (!values || values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (values.length - 1);

  return values
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (v - min) / range) * (h - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function TrendCard({
  title,
  change,
  data,
  color = "#0ea5e9",
}: {
  title: string;
  change: string;
  data: number[];
  color?: string;
}) {
  const w = 520;
  const h = 160;
  const path = buildPath(data, w, h, 16);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{change}</div>
          <div className="text-xs text-emerald-600">Last 30 Days {change}</div>
        </div>
      </div>

      <div className="h-40 w-full">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

          {/* Filled area */}
          <path d={`${path} L ${w - 16} ${h - 16} L 16 ${h - 16} Z`} fill="url(#grad)" opacity="0.9" />

          {/* X labels */}
          {months.map((m, i) => {
            const stepX = (w - 32) / (months.length - 1);
            const x = 16 + i * stepX;
            return (
              <text key={m} x={x} y={h - 4} fontSize={10} fill="#64748b" textAnchor="middle">
                {m}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
