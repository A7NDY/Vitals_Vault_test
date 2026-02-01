import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorRequestManager from "@/lib/doctor-requests";
import { PatientDataStorage } from "@/lib/storage";

const pending: any[] = [];
const approved: any[] = [];

export default function Doctors() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If logged-in user is a Doctor, show the doctor dashboard
  if (user && user.role === "Doctor") {
    const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
    const [vitals, setVitals] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctorReports, setDoctorReports] = useState<any[]>([]);

    useEffect(() => {
      if (user?.email) {
        // Load connected patients
        const patients = DoctorRequestManager.getAcceptedPatientsForDoctor(user.email);
        setConnectedPatients(patients);

        // Load all vitals and filter for connected patients
        try {
          const allVitals = JSON.parse(localStorage.getItem("vv_vitals") || "[]");
          setVitals(allVitals);
        } catch (e) {
          setVitals([]);
        }

        // Load appointments
        try {
          const allAppts = JSON.parse(localStorage.getItem("vv_doctor_appts") || "[]");
          setAppointments(allAppts);
        } catch (e) {
          setAppointments([]);
        }

        // Load reports
        try {
          const allReports = JSON.parse(localStorage.getItem("vv_doctor_reports") || "[]");
          setDoctorReports(allReports);
        } catch (e) {
          setDoctorReports([]);
        }
      }
    }, [user?.email]);

    const patientEmails = useMemo(() => new Set(connectedPatients.map((p) => p.email)), [connectedPatients]);

    const patientWithVitals = useMemo(() => {
      return connectedPatients.map((p) => {
        const patientVitals = vitals.filter((v: any) => v.patientEmail === p.email);
        const lastVital = patientVitals[patientVitals.length - 1];
        const data = PatientDataStorage.getPatientData(p.email);
        return {
          email: p.email,
          name: p.fullName,
          age: data ? parseInt(data.age) : 0,
          lastUpdate: lastVital ? new Date(lastVital.datetime).toLocaleDateString() : "Never",
          risk: "Stable",
          lastVital,
        };
      });
    }, [connectedPatients, vitals]);

    const upcomingAppts = useMemo(() => {
      return appointments
        .filter((a: any) => new Date(`${a.date}T${a.time}`).getTime() >= Date.now())
        .slice(0, 5)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [appointments]);

    const recentReports = useMemo(() => {
      return doctorReports.filter((r: any) => patientEmails.has(r.patientEmail)).slice(0, 5);
    }, [doctorReports, patientEmails]);

    const vitalsStats = useMemo(() => {
      if (vitals.length === 0) return { bp: "—", hr: "—", spO2: "—", sugar: "—" };
      const lastVital = vitals[vitals.length - 1];
      return {
        bp: lastVital.bp || "—",
        hr: lastVital.hr ? `${lastVital.hr} bpm` : "—",
        spO2: lastVital.spO2 ? `${lastVital.spO2}%` : "—",
        sugar: lastVital.bg ? `${lastVital.bg} mg/dL` : "—",
      };
    }, [vitals]);

    const counts = useMemo(
      () => ({
        total: connectedPatients.length,
        normal: patientWithVitals.filter((p) => p.risk === "Normal").length,
        intermediate: patientWithVitals.filter((p) => p.risk === "Intermediate").length,
        critical: patientWithVitals.filter((p) => p.risk === "Critical").length,
      }),
      [patientWithVitals],
    );

    return (
      <MainLayout>
        <div>
          {/* Top search */}
          <div className="mb-6">
            <div className="relative max-w-4xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                placeholder="Search patients"
                className="h-12 w-full rounded-md border border-slate-200 bg-white/80 pl-11 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex items-center justify-start gap-3">
              <select className="h-9 rounded-md border bg-white px-3 text-sm text-slate-700">
                <option>All</option>
                <option>Critical</option>
                <option>Intermediate</option>
                <option>Normal</option>
              </select>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-100/60 p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Patients</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {counts.total}
              </div>
            </div>
            <div className="rounded-lg bg-slate-100/60 p-4 shadow-sm">
              <div className="text-sm text-slate-500">Normal</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {counts.normal}
              </div>
            </div>
            <div className="rounded-lg bg-slate-100/60 p-4 shadow-sm">
              <div className="text-sm text-slate-500">Intermediate</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {counts.intermediate}
              </div>
            </div>
            <div className="rounded-lg bg-slate-100/60 p-4 shadow-sm">
              <div className="text-sm text-slate-500">Critical</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {counts.critical}
              </div>
            </div>
          </div>

          {/* Connected Patients */}
          {patientWithVitals.length === 0 ? (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Your Patients</h2>
              <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
                <p className="text-slate-600">No connected patients yet. Patients will appear here once they connect with you.</p>
              </div>
            </section>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">Your Patients ({patientWithVitals.length})</h2>
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
                            Last Update
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {" "}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {patientWithVitals.map((p) => (
                          <tr key={p.email}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                              {p.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {p.age}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {p.lastUpdate}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">
                              <button
                                onClick={() => navigate(`/patient/${p.email}`)}
                                className="hover:underline cursor-pointer"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Latest Vitals Overview */}
              <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">Latest Vitals Overview</h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Blood Pressure</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {vitalsStats.bp}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">Latest reading</div>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Heart Rate</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {vitalsStats.hr}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">Latest reading</div>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">SpO₂</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {vitalsStats.spO2}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">Latest reading</div>
                  </div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Blood Sugar</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {vitalsStats.sugar}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">Latest reading</div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Upcoming Appointments */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">
              Upcoming Appointments
            </h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date/Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {upcomingAppts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                          No upcoming appointments
                        </td>
                      </tr>
                    ) : (
                      upcomingAppts.map((a) => (
                        <tr key={a.id}>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {a.patient}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(a.date).toLocaleDateString()} {a.time}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {a.type}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Recent Reports */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Recent Reports</h2>
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {recentReports.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                          No reports yet
                        </td>
                      </tr>
                    ) : (
                      recentReports.map((r) => (
                        <tr key={r.id}>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {r.patientName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {r.reportType}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(r.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/my-patients")} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">
                View All Patients
              </button>
              <button onClick={() => navigate("/appointments")} className="rounded-md border px-4 py-2 text-sm">
                Manage Appointments
              </button>
              <button onClick={() => navigate("/reports")} className="rounded-md border px-4 py-2 text-sm">
                Add Report
              </button>
              <button onClick={() => navigate("/messages")} className="rounded-md border px-4 py-2 text-sm">
                View Messages
              </button>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  // Admin view (existing)
  return (
    <MainLayout>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">
        Doctor Management
      </h1>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4 text-sm font-medium text-slate-700">
          Pending Doctor Requests
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  License/ID Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pending.map((p) => (
                <tr key={p.email}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-sky-600">{p.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {p.specialization}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button className="text-slate-700 underline hover:text-slate-900">
                      Download
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button className="text-emerald-600 hover:text-emerald-700">
                        Approve
                      </button>
                      <span className="text-slate-300">|</span>
                      <button className="text-rose-600 hover:text-rose-700">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Approved Doctors
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative w-full max-w-3xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              placeholder="Search doctors"
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-100/70 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
            />
          </div>
          <div className="hidden gap-2 md:flex">
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">
              Specialization ▾
            </button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">
              Status ▾
            </button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50">
              Join Date ▾
            </button>
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
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Patients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {approved.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-sky-600">
                      {p.specialization}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {p.patients}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-slate-700 hover:text-slate-900">
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        {p.status === "Active" ? (
                          <button className="text-rose-600 hover:text-rose-700">
                            Deactivate
                          </button>
                        ) : (
                          <button className="text-emerald-600 hover:text-emerald-700">
                            Activate
                          </button>
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
