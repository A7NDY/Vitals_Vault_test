import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Search, Plus } from "lucide-react";

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
