import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Watch, TrendingUp, AlertCircle } from "lucide-react";

interface WearableVitalsData {
  date: string;
  heartRate?: number;
  steps?: number;
  calories?: number;
  sleepDuration?: number;
}

interface WearableVitalsSectionProps {
  patientEmail: string;
  isConnected?: boolean;
}

export default function WearableVitalsSection({
  patientEmail,
  isConnected = false,
}: WearableVitalsSectionProps) {
  const [vitalsData, setVitalsData] = useState<WearableVitalsData[]>([]);
  const [smartwatchConnected, setSmartWatchConnected] = useState(isConnected);
  const [loading, setLoading] = useState(true);

  // Load wearable vitals data on component mount
  useEffect(() => {
    // Simulate loading data - in production this would come from API
    setTimeout(() => {
      // Generate mock data for the last 7 days
      const mockData: WearableVitalsData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          heartRate: 60 + Math.floor(Math.random() * 30),
          steps: 5000 + Math.floor(Math.random() * 10000),
          calories: 2000 + Math.floor(Math.random() * 500),
          sleepDuration: 6 + Math.random() * 3,
        });
      }

      setVitalsData(mockData);
      // Check if patient has connected smartwatch (would come from API in production)
      setSmartWatchConnected(true);
      setLoading(false);
    }, 500);
  }, [patientEmail]);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading wearable vitals...</div>
        </div>
      </div>
    );
  }

  if (!smartwatchConnected) {
    return (
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
        <div className="flex items-center gap-3 text-slate-600">
          <Watch className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Smartwatch Not Connected</h3>
            <p className="text-sm text-slate-500">
              Patient has not connected a smartwatch yet. Wearable vitals will appear once connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Watch className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-900">
          Patient Wearable Vitals
        </h2>
        <span className="ml-auto inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="mr-2 h-2 w-2 rounded-full bg-green-600" />
          Connected
        </span>
      </div>

      {/* Heart Rate Chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Heart Rate (BPM)</h3>
          <p className="text-sm text-slate-500">Last 7 days trend</p>
        </div>

        {vitalsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[50, 110]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") return [value.toFixed(0), "BPM"];
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No data available
          </div>
        )}
      </div>

      {/* Steps Chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Daily Steps</h3>
          <p className="text-sm text-slate-500">Last 7 days activity</p>
        </div>

        {vitalsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vitalsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") return [value.toLocaleString(), "Steps"];
                  return value;
                }}
              />
              <Bar
                dataKey="steps"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No data available
          </div>
        )}
      </div>

      {/* Sleep Duration Chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Sleep Duration</h3>
          <p className="text-sm text-slate-500">Last 7 days sleep pattern</p>
        </div>

        {vitalsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") return [value.toFixed(1), "Hours"];
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="sleepDuration"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: "#a855f7", r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No data available
          </div>
        )}
      </div>

      {/* Wearable Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Avg Heart Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-red-900">
            {vitalsData.length > 0
              ? Math.round(
                  vitalsData.reduce((sum, d) => sum + (d.heartRate || 0), 0) /
                    vitalsData.length
                )
              : "—"}
          </div>
          <div className="mt-1 text-xs text-red-700">BPM</div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Total Steps
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {vitalsData.length > 0
              ? (
                  vitalsData.reduce((sum, d) => sum + (d.steps || 0), 0) / 1000
                ).toFixed(1)
              : "—"}
          </div>
          <div className="mt-1 text-xs text-blue-700">K Steps</div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
          <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Avg Calories
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-900">
            {vitalsData.length > 0
              ? Math.round(
                  vitalsData.reduce((sum, d) => sum + (d.calories || 0), 0) /
                    vitalsData.length
                )
              : "—"}
          </div>
          <div className="mt-1 text-xs text-orange-700">kcal</div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Avg Sleep
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-900">
            {vitalsData.length > 0
              ? (
                  vitalsData.reduce((sum, d) => sum + (d.sleepDuration || 0), 0) /
                  vitalsData.length
                ).toFixed(1)
              : "—"}
          </div>
          <div className="mt-1 text-xs text-purple-700">hours</div>
        </div>
      </div>

      {/* Read-only Badge */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 border border-slate-200">
        <AlertCircle className="w-4 h-4 text-slate-500" />
        <p className="text-xs text-slate-600">
          This data is read-only and automatically synced from the patient's wearable device.
        </p>
      </div>
    </div>
  );
}
