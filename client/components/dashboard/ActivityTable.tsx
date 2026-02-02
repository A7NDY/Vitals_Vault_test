import { useEffect, useState } from "react";

type Row = { activity: string; details: string; timestamp: string };

export default function ActivityTable() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    // Load real activities from system
    const activities: Row[] = [];

    // Check for recent user registrations
    try {
      const users = JSON.parse(localStorage.getItem("vv_registered_users") || "[]");
      if (users.length > 0) {
        const lastUser = users[users.length - 1];
        activities.push({
          activity: "Latest Registration",
          details: `${lastUser.fullName} (${lastUser.role}) registered`,
          timestamp: "Recently",
        });
      }
    } catch (e) {
      // ignore
    }

    // Check for recent doctor requests
    try {
      const requests = JSON.parse(localStorage.getItem("vv_doctor_requests") || "[]");
      const pending = requests.filter((r: any) => r.status === "pending");
      if (pending.length > 0) {
        activities.push({
          activity: "Pending Requests",
          details: `${pending.length} doctor connection request(s) awaiting approval`,
          timestamp: "Recent",
        });
      }
    } catch (e) {
      // ignore
    }

    // Check for recent vitals
    try {
      const vitals = JSON.parse(localStorage.getItem("vv_vitals") || "[]");
      if (vitals.length > 0) {
        activities.push({
          activity: "Recent Vitals Entry",
          details: `Patient submitted vital signs reading`,
          timestamp: "Recently",
        });
      }
    } catch (e) {
      // ignore
    }

    if (activities.length === 0) {
      activities.push({
        activity: "No Activities",
        details: "No recent activities to display",
        timestamp: "—",
      });
    }

    setRows(activities.slice(0, 5));
  }, []);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4 text-sm font-medium text-slate-700">
        Recent Activities
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                  {row.activity}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {row.details}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {row.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
