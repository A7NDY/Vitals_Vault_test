import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";

const pending = [
  {
    name: "Dr. Emily Carter",
    email: "emily.carter@example.com",
    specialization: "Cardiology",
    proof: "License.pdf",
  },
  {
    name: "Dr. Robert Harris",
    email: "robert.harris@example.com",
    specialization: "Dermatology",
    proof: "License.pdf",
  },
  {
    name: "Dr. Olivia Bennett",
    email: "olivia.bennett@example.com",
    specialization: "Neurology",
    proof: "License.pdf",
  },
];

const approved = [
  {
    name: "Dr. Ethan Walker",
    specialization: "Pediatrics",
    patients: 250,
    status: "Active",
  },
  {
    name: "Dr. Sophia Clark",
    specialization: "Orthopedics",
    patients: 320,
    status: "Active",
  },
  {
    name: "Dr. Noah Turner",
    specialization: "Ophthalmology",
    patients: 180,
    status: "Suspended",
  },
  {
    name: "Dr. Ava Mitchell",
    specialization: "Psychiatry",
    patients: 210,
    status: "Active",
  },
  {
    name: "Dr. Liam Foster",
    specialization: "Urology",
    patients: 150,
    status: "Active",
  },
];

export default function Doctors() {
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
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
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
