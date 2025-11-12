import MainLayout from "@/components/layout/MainLayout";
import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

const pending = [
  { name: "Dr. Emily Carter", email: "emily.carter@example.com", specialization: "Cardiology", proof: "License.pdf" },
  { name: "Dr. Robert Harris", email: "robert.harris@example.com", specialization: "Dermatology", proof: "License.pdf" },
  { name: "Dr. Olivia Bennett", email: "olivia.bennett@example.com", specialization: "Neurology", proof: "License.pdf" },
];

const approved = [
  { name: "Dr. Ethan Walker", specialization: "Pediatrics", patients: 250, status: "Active" },
  { name: "Dr. Sophia Clark", specialization: "Orthopedics", patients: 320, status: "Active" },
  { name: "Dr. Noah Turner", specialization: "Ophthalmology", patients: 180, status: "Suspended" },
  { name: "Dr. Ava Mitchell", specialization: "Psychiatry", patients: 210, status: "Active" },
  { name: "Dr. Liam Foster", specialization: "Urology", patients: 150, status: "Active" },
];

// Data used by doctor dashboard
const doctorPatients = [
  { name: "Liam Carter", age: 65, lastUpdate: "2023-11-15", risk: "Critical" },
  { name: "Olivia Bennett", age: 72, lastUpdate: "2023-11-10", risk: "Critical" },
  { name: "Noah Harper", age: 58, lastUpdate: "2023-11-05", risk: "Critical" },
  { name: "Ethan Clark", age: 48, lastUpdate: "2023-11-20", risk: "Intermediate" },
  { name: "Ava Foster", age: 55, lastUpdate: "2023-11-18", risk: "Intermediate" },
  { name: "Mia Turner", age: 60, lastUpdate: "2023-11-12", risk: "Intermediate" },
];

const vitalsOverview = [
  { title: "Blood Pressure", value: "120/80 mmHg", change: "+2%", note: "Last 7 Days" },
  { title: "Blood Sugar", value: "90 mg/dL", change: "-1%", note: "Last 7 Days" },
  { title: "SpO₂", value: "95%", change: "+0.5%", note: "Last 7 Days" },
];

const upcoming = [
  { dt: "2023-12-05 10:00 AM", type: "Routine Checkup" },
  { dt: "2023-12-10 02:00 PM", type: "Follow-up" },
  { dt: "2023-12-15 11:00 AM", type: "Consultation" },
];

const reports = ["Report 1", "Report 2", "Report 3", "Report 4", "Report 5"];

export default function Doctors() {
  const { user } = useAuth();

  // If logged-in user is a Doctor, show the doctor dashboard
  if (user && user.role === "Doctor") {
    const counts = useMemo(() => {
      const total = doctorPatients.length;
      const normal = doctorPatients.filter((p) => p.risk === "Normal").length;
      const intermediate = doctorPatients.filter((p) => p.risk === "Intermediate").length;
      const critical = doctorPatients.filter((p) => p.risk === "Critical").length;
      return { total, normal, intermediate, critical };
    }, []);

    return (
      <MainLayout>
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Doctor Dashboard</h1>
            <div className="relative w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Search patients" className="h-10 w-full rounded-md border border-slate-200 bg-slate-100/70 pl-9 pr-3 text-sm text-slate-700" />
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Patients</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{counts.total}</div>
            </div>
            <div className="w-40 rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Normal</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{counts.normal}</div>
            </div>
            <div className="w-40 rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Intermediate</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{counts.intermediate}</div>
            </div>
            <div className="w-40 rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Critical</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{counts.critical}</div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Critical Patients</h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Update</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {doctorPatients.filter((p) => p.risk === "Critical").map((p) => (
                      <tr key={p.name}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.lastUpdate}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">View Profile</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Intermediate Patients</h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Last Update</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {doctorPatients.filter((p) => p.risk === "Intermediate").map((p) => (
                      <tr key={p.name}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.lastUpdate}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">View Profile</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Vitals Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {vitalsOverview.map((v) => (
                <div key={v.title} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">{v.title}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{v.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{v.note} • <span className={`text-sm ${v.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>{v.change}</span></div>
                  <svg className="mt-4 h-20 w-full text-slate-300" viewBox="0 0 120 32" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" points="0,18 20,14 40,18 60,8 80,12 100,20 120,10" />
                  </svg>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Upcoming Appointments</h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date/Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {upcoming.map((a) => (
                      <tr key={a.dt}>
                        <td className="px-6 py-4 text-sm text-slate-600">{a.dt}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{a.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Recent Reports</h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Report</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {reports.map((r) => (
                      <tr key={r}>
                        <td className="px-6 py-4 text-sm text-slate-700">{r}</td>
                        <td className="px-6 py-4 text-sm text-sky-600">Download</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">Add Patient</button>
              <button className="rounded-md border px-4 py-2 text-sm">Schedule Checkup</button>
              <button className="rounded-md border px-4 py-2 text-sm">Export Reports</button>
              <button className="rounded-md border px-4 py-2 text-sm">Start Video Call</button>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  // Admin view (existing)
  return (
    <MainLayout>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">Doctor Management</h1>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4 text-sm font-medium text-slate-700">Pending Doctor Requests</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">License/ID Proof</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pending.map((p) => (
                <tr key={p.email}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-sky-600">{p.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.specialization}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm"><button className="text-slate-700 underline hover:text-slate-900">Download</button></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button className="text-emerald-600 hover:text-emerald-700">Approve</button>
                      <span className="text-slate-300">|</span>
                      <button className="text-rose-600 hover:text-rose-700">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 text-sm font-medium text-slate-700">Approved Doctors</div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative w-full max-w-3xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input placeholder="Search doctors" className="h-10 w-full rounded-md border border-slate-200 bg-slate-100/70 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none" />
          </div>
          <div className="hidden gap-2 md:flex">
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">Specialization ▾</button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">Status ▾</button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">Join Date ▾</button>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total Patients</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {approved.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-sky-600">{p.specialization}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.patients}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status}</span></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-slate-700 hover:text-slate-900">Edit</button>
                        <span className="text-slate-300">|</span>
                        {p.status === "Active" ? (
                          <button className="text-rose-600 hover:text-rose-700">Deactivate</button>
                        ) : (
                          <button className="text-emerald-600 hover:text-emerald-700">Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
