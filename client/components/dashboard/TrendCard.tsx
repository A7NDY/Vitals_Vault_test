import { ResponsiveContainer, LineChart, Line, XAxis } from "recharts";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

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
  const chartData = months.map((m, i) => ({ name: m, value: data[i] ?? 0 }));

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{change}</div>
          <div className="text-xs text-emerald-600">Last 30 Days +{change.replace("+", "")}</div>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
