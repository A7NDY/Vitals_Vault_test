import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Patient = {
  name: string;
  email: string;
  assigned: string;
  status: "Active" | "Inactive" | "Suspended";
  registered: string; // YYYY-MM-DD
  lastLogin: string; // YYYY-MM-DD
};

const PATIENTS: Patient[] = [
  { name: "Sophia Carter", email: "sophia.carter@email.com", assigned: "Dr. Emily White", status: "Active", registered: "2023-01-15", lastLogin: "2024-03-10" },
  { name: "Liam Bennett", email: "liam.bennett@email.com", assigned: "Dr. Michael Green", status: "Inactive", registered: "2022-11-20", lastLogin: "2023-12-05" },
  { name: "Olivia Hayes", email: "olivia.hayes@email.com", assigned: "Dr. Emily White", status: "Active", registered: "2023-05-08", lastLogin: "2024-03-12" },
  { name: "Noah Parker", email: "noah.parker@email.com", assigned: "Dr. David Brown", status: "Active", registered: "2023-02-28", lastLogin: "2024-03-09" },
  { name: "Ava Reynolds", email: "ava.reynolds@email.com", assigned: "Dr. Michael Green", status: "Active", registered: "2023-07-10", lastLogin: "2024-03-11" },
  { name: "Ethan Foster", email: "ethan.foster@email.com", assigned: "Dr. Emily White", status: "Inactive", registered: "2022-10-05", lastLogin: "2023-11-15" },
  { name: "Isabella Coleman", email: "isabella.coleman@email.com", assigned: "Dr. David Brown", status: "Active", registered: "2023-04-12", lastLogin: "2024-03-10" },
  { name: "Mason Hughes", email: "mason.hughes@email.com", assigned: "Dr. Michael Green", status: "Active", registered: "2023-09-22", lastLogin: "2024-03-12" },
  { name: "Mia Jenkins", email: "mia.jenkins@email.com", assigned: "Dr. Emily White", status: "Active", registered: "2023-03-18", lastLogin: "2024-03-08" },
  { name: "Lucas Sullivan", email: "lucas.sullivan@email.com", assigned: "Dr. David Brown", status: "Inactive", registered: "2022-12-01", lastLogin: "2023-12-20" },
];

export default function Patients() {
  const { user } = useAuth();

  // If logged-in user is a patient, show patient dashboard
  if (user && user.role === "Patient") {
    const shortName = user.email.split("@")[0];
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Welcome back, {shortName}</h1>
          <p className="mt-4 text-slate-600">Vitals Summary</p>

          <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">120/80 mmHg</div>
              <div className="mt-2 text-xs text-slate-400">Blood Pressure</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">72 bpm</div>
              <div className="mt-2 text-xs text-slate-400">Heart Rate</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">98%</div>
              <div className="mt-2 text-xs text-slate-400">SpO2</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">100 mg/dL</div>
              <div className="mt-2 text-xs text-slate-400">Blood Sugar</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">5,000 steps</div>
              <div className="mt-2 text-xs text-slate-400">Steps</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Low</div>
              <div className="mt-2 text-xs text-slate-400">AI Risk Score</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Medication Reminders</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                  <div>
                    <div className="text-sm font-medium">Metformin</div>
                    <div className="text-xs text-slate-500">Take 1 tablet</div>
                  </div>
                  <div className="text-sm text-slate-400">8:00 AM</div>
                </li>
                <li className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                  <div>
                    <div className="text-sm font-medium">Lisinopril</div>
                    <div className="text-xs text-slate-500">Take 1 tablet</div>
                  </div>
                  <div className="text-sm text-slate-400">8:00 AM</div>
                </li>
                <li className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                  <div>
                    <div className="text-sm font-medium">Atorvastatin</div>
                    <div className="text-xs text-slate-500">Take 1 tablet</div>
                  </div>
                  <div className="text-sm text-slate-400">8:00 PM</div>
                </li>
              </ul>

              <div className="mt-6 flex gap-3">
                <button className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white">Log Vitals</button>
                <button className="rounded-md border px-3 py-2 text-sm">View Reports</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Recent Messages</h3>
              <div className="mt-4 rounded-md bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <img src="https://i.pravatar.cc/40?img=65" className="h-9 w-9 rounded-full" />
                  <div>
                    <div className="text-sm font-medium">Dr. Emily Carter</div>
                    <div className="text-xs text-slate-500">Your blood pressure is slightly elevated. Please monitor it closely.</div>
                  </div>
                </div>
              </div>

              <h3 className="mt-6 text-lg font-medium">Blood Pressure Trend</h3>
              <div className="mt-4 rounded-md bg-white p-6 shadow-sm">
                <div className="text-2xl font-bold">120/80 mmHg</div>
                <div className="text-sm text-rose-600 mt-2">Last 30 Days -2%</div>
                <svg className="mt-6 h-40 w-full" viewBox="0 0 520 160">
                  <path d="M20 120 C60 80 100 100 140 60 C180 20 220 60 260 100 C300 140 340 60 380 80 C420 100 460 20 500 60" fill="none" stroke="#0f172a" strokeWidth="2" strokeOpacity="0.15" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Admin-facing patients management (existing table)
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [doctorFilter, setDoctorFilter] = useState<string>("All");

  const doctors = useMemo(() => ["All", ...Array.from(new Set(PATIENTS.map((p) => p.assigned)) )], []);

  const filtered = useMemo(() => {
    return PATIENTS.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (doctorFilter !== "All" && p.assigned !== doctorFilter) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.email.toLowerCase().includes(query.toLowerCase()) ||
        p.assigned.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [query, statusFilter, doctorFilter]);

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">Patients</h1>
        <button className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Add Patient
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-3">
            <div className="relative w-full max-w-3xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm text-slate-700">
              {doctors.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm text-slate-700">
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>

            <select className="hidden h-10 rounded-md border bg-white px-3 text-sm text-slate-700 md:block">
              <option>Chronic Condition</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((p) => (
                <tr key={p.email}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-sky-600">{p.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.assigned}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.registered}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.lastLogin}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-slate-700 hover:text-slate-900">Edit</button>
                      <span className="text-slate-300">|</span>
                      {p.status === "Active" ? (
                        <button className="text-rose-600 hover:text-rose-700">Deactivate</button>
                      ) : (
                        <button className="text-emerald-600 hover:text-emerald-700">Activate</button>
                      )}
                      <span className="text-slate-300">|</span>
                      <button className="text-sky-600 hover:text-sky-700">Devices</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
