import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState } from "react";

type Patient = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastUpdate: string; // YYYY-MM-DD
  status: "Critical" | "Stable" | "Recovering";
};

const PATIENTS: Patient[] = [
  { name: "Sophia Carter", age: 65, gender: "Female", lastUpdate: "2023-11-15", status: "Critical" },
  { name: "Ethan Bennett", age: 72, gender: "Male", lastUpdate: "2023-11-18", status: "Stable" },
  { name: "Olivia Hayes", age: 58, gender: "Female", lastUpdate: "2023-11-20", status: "Stable" },
  { name: "Liam Foster", age: 60, gender: "Male", lastUpdate: "2023-11-17", status: "Stable" },
  { name: "Ava Morgan", age: 68, gender: "Female", lastUpdate: "2023-11-19", status: "Stable" },
  { name: "Noah Parker", age: 75, gender: "Male", lastUpdate: "2023-11-16", status: "Stable" },
  { name: "Isabella Reed", age: 62, gender: "Female", lastUpdate: "2023-11-21", status: "Stable" },
  { name: "Jackson Cole", age: 69, gender: "Male", lastUpdate: "2023-11-22", status: "Stable" },
  { name: "Mia Hughes", age: 55, gender: "Female", lastUpdate: "2023-11-23", status: "Stable" },
  { name: "Aiden Brooks", age: 70, gender: "Male", lastUpdate: "2023-11-24", status: "Stable" },
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
          <p className="mt-4 text-slate-600">Your recent vitals and messages.</p>

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
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Admin-facing patients management (table matching design)
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return PATIENTS.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (genderFilter !== "All" && p.gender !== genderFilter) return false;
      if (!query) return true;
      return p.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, statusFilter, genderFilter]);

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="relative max-w-4xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-12 w-full rounded-md border border-slate-200 bg-white/80 pl-11 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none" />
        </div>

        <div className="mt-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border bg-white px-3 text-sm text-slate-700">
            <option>All</option>
            <option>Critical</option>
            <option>Stable</option>
            <option>Recovering</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Age</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Update</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((p) => (
                <tr key={p.name}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.gender}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.lastUpdate}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${p.status === "Critical" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">View Profile</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
