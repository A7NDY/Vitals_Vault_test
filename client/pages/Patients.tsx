import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager from "@/lib/doctor-requests";

type Patient = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastUpdate: string; // YYYY-MM-DD
  status: "Critical" | "Stable" | "Recovering";
};

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if patient has completed data entry on first login
  useEffect(() => {
    if (user && user.role === "Patient") {
      const storageKey = `vv_patient_data_${user.email}`;
      const hasData = localStorage.getItem(storageKey);

      if (!hasData) {
        navigate("/patient-data-entry");
      }
    }
  }, [user, navigate]);

  // If logged-in user is a patient, show patient dashboard
  if (user && user.role === "Patient") {
    const shortName = user.email.split("@")[0];

    // Load real vitals from storage
    const [vitals, setVitals] = useState<any[]>([]);
    const [connectedDoctors, setConnectedDoctors] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);

    useEffect(() => {
      // Load vitals
      try {
        const vv = localStorage.getItem("vv_vitals");
        const vitalsData = vv ? JSON.parse(vv) : [];
        setVitals(vitalsData);
      } catch (e) {
        setVitals([]);
      }

      // Load connected doctors
      const doctors = DoctorRequestManager.getAcceptedDoctorsForPatient(user.email);
      setConnectedDoctors(doctors);

      // Load medications
      try {
        const med = localStorage.getItem("vv_meds");
        const medsData = med ? JSON.parse(med) : [];
        setMedications(medsData.filter((m: any) => m.status === "Active"));
      } catch (e) {
        setMedications([]);
      }
    }, [user.email]);

    // Get last vital reading
    const lastVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

    // Get recent messages from connected doctors
    const [messages, setMessages] = useState<any[]>([]);
    useEffect(() => {
      try {
        const msgs = localStorage.getItem("vv_messages");
        const allMsgs = msgs ? JSON.parse(msgs) : [];
        const doctorEmails = new Set(connectedDoctors.map((d: any) => d.email));
        const filtered = allMsgs.filter((m: any) => m.sender === "doctor").slice(-1);
        setMessages(filtered);
      } catch (e) {
        setMessages([]);
      }
    }, [connectedDoctors]);

    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Welcome back, {shortName}</h1>
          <p className="mt-4 text-slate-600">
            Your recent vitals and messages.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{lastVital?.bp || "—"}</div>
              <div className="mt-2 text-xs text-slate-400">Blood Pressure</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{lastVital?.hr ? `${lastVital.hr} bpm` : "—"}</div>
              <div className="mt-2 text-xs text-slate-400">Heart Rate</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{lastVital?.spO2 ? `${lastVital.spO2}%` : "—"}</div>
              <div className="mt-2 text-xs text-slate-400">SpO2</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{lastVital?.bg ? `${lastVital.bg} mg/dL` : "—"}</div>
              <div className="mt-2 text-xs text-slate-400">Blood Sugar</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{lastVital?.weight ? `${lastVital.weight} kg` : "—"}</div>
              <div className="mt-2 text-xs text-slate-400">Weight</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{connectedDoctors.length}</div>
              <div className="mt-2 text-xs text-slate-400">Connected Doctors</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Medication Reminders</h3>
              {medications.length === 0 ? (
                <div className="mt-4 rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No active medications. Go to Medications page to add them.
                </div>
              ) : (
                <ul className="mt-4 space-y-4">
                  {medications.slice(0, 2).map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                      <div>
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.dosage}</div>
                      </div>
                      <div className="text-sm text-slate-400">{m.time}</div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={() => navigate("/vitals")} className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white">
                  Log Vitals
                </button>
                <button onClick={() => navigate("/reports")} className="rounded-md border px-3 py-2 text-sm">
                  View Reports
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Recent Messages</h3>
              {messages.length === 0 ? (
                <div className="mt-4 rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
                  {connectedDoctors.length === 0 ? "Connect with doctors to receive messages" : "No messages yet"}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {messages.map((m: any) => (
                    <div key={m.id} className="rounded-md bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <img
                          src={`https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`}
                          className="h-9 w-9 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Doctor</div>
                          <div className="text-xs text-slate-500">{m.text}</div>
                          <div className="mt-1 text-xs text-slate-400">{new Date(m.time).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-12 w-full rounded-md border border-slate-200 bg-white/80 pl-11 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          />
        </div>

        <div className="mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border bg-white px-3 text-sm text-slate-700"
          >
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
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((p) => (
                <tr key={p.name}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {p.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {p.lastUpdate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${p.status === "Critical" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">
                    View Profile
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
