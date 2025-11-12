import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

type Series = number[];

function buildPath(values: number[], w = 700, h = 220, padding = 20) {
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

const demo = {
  bp: [120, 122, 118, 121, 119, 125, 121],
  hr: [70, 72, 71, 73, 69, 75, 72],
  spo2: [98, 97, 98, 99, 98, 97, 98],
  sugar: [102, 100, 98, 105, 99, 101, 100],
};

export default function Reports() {
  const [range, setRange] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  const metrics = useMemo(
    () => [
      { key: "bp", label: "Blood Pressure", unit: "mmHg", value: "120/80", delta: -2 },
      { key: "hr", label: "Heart Rate", unit: "bpm", value: "72", delta: +1 },
      { key: "spo2", label: "SpO2", unit: "%", value: "98", delta: 0 },
      { key: "sugar", label: "Blood Sugar", unit: "mg/dL", value: "100", delta: -3 },
    ],
    [],
  );

  const seriesMap: Record<string, Series> = useMemo(
    () => ({ bp: demo.bp, hr: demo.hr, spo2: demo.spo2, sugar: demo.sugar }),
    [],
  );

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-semibold">Vitals Trends</h1>
        <p className="mt-2 text-slate-600">Track your vital signs over time to monitor your health and progress.</p>

        <div className="mt-6 mb-6 flex gap-4">
          {(["Daily", "Weekly", "Monthly"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-2 text-sm ${r === range ? "bg-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              {r}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {metrics.map((m) => {
            const s = seriesMap[m.key];
            const path = buildPath(s, 680, 160, 20);
            return (
              <section key={m.key}>
                <h2 className="mb-3 text-lg font-medium">{m.label}</h2>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-sm text-slate-500">{m.label} ({m.unit})</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{m.value}</div>
                      <div className={`mt-1 text-sm ${m.delta > 0 ? "text-emerald-600" : m.delta < 0 ? "text-rose-600" : "text-slate-600"}`}>Last 7 Days {m.delta > 0 ? `+${m.delta}%` : `${m.delta}%`}</div>
                    </div>

                    <div className="flex-1">
                      <svg viewBox={`0 0 700 160`} className="w-full h-40">
                        <defs>
                          <linearGradient id={`g-${m.key}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={path} fill="none" stroke="#0f172a" strokeWidth={2} strokeOpacity={0.15} />
                        <path d={`${path} L 680 140 L 20 140 Z`} fill={`url(#g-${m.key})`} />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button className="rounded-md border bg-white px-4 py-2 text-sm">Download PDF</button>
          <button className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white">Share with Doctor</button>
        </div>
      </div>
    </MainLayout>
  );
}
