type Row = { activity: string; details: string; timestamp: string };

const rows: Row[] = [
  {
    activity: "Last Login",
    details: "Dr. Emily Carter logged in",
    timestamp: "2 hours ago",
  },
  {
    activity: "Latest Doctor Registration",
    details: "Dr. David Lee registered",
    timestamp: "5 hours ago",
  },
  {
    activity: "Recent AI Alert",
    details: "AI detected anomaly in patient data for patient Sarah Miller",
    timestamp: "10 hours ago",
  },
];

export default function ActivityTable() {
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
