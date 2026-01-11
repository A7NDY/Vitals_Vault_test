import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager, { DoctorProfile } from "@/lib/doctor-requests";
import { Check, X } from "lucide-react";

type Appt = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctor: string;
  type: string;
  notes?: string;
};

const SAMPLE: Appt[] = [
  {
    id: "a1",
    date: "2024-07-15",
    time: "10:00",
    doctor: "Dr. Emily Carter",
    type: "Check-up",
  },
  {
    id: "a2",
    date: "2024-07-22",
    time: "14:00",
    doctor: "Dr. Robert Harris",
    type: "Consultation",
  },
  {
    id: "a3",
    date: "2024-08-05",
    time: "11:30",
    doctor: "Dr. Emily Carter",
    type: "Follow-up",
  },
];

function loadAppts() {
  try {
    const raw = localStorage.getItem("vv_appts");
    return raw ? (JSON.parse(raw) as Appt[]) : SAMPLE;
  } catch (e) {
    return SAMPLE;
  }
}

function persistAppts(appts: Appt[]) {
  try {
    localStorage.setItem("vv_appts", JSON.stringify(appts));
  } catch (e) {
    // ignore
  }
}

export default function Appointments() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appt[]>(() => loadAppts());
  const [availableDoctors, setAvailableDoctors] = useState<DoctorProfile[]>([]);
  const [acceptedDoctors, setAcceptedDoctors] = useState<DoctorProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [showDoctorRequests, setShowDoctorRequests] = useState(false);

  useEffect(() => persistAppts(appts), [appts]);

  // Load available doctors and requests
  useEffect(() => {
    const doctors = DoctorRequestManager.getAvailableDoctors();
    setAvailableDoctors(doctors);

    if (user?.email) {
      const accepted = DoctorRequestManager.getAcceptedDoctorsForPatient(user.email);
      setAcceptedDoctors(accepted);

      // Get pending request emails
      const allRequests = DoctorRequestManager.getRequestsFromPatient(user.email);
      const pending = allRequests
        .filter((r) => r.status === "pending")
        .map((r) => r.doctorEmail);
      setPendingRequests(pending);
    }
  }, [user?.email]);

  const upcoming = useMemo(
    () =>
      appts
        .filter((a) => new Date(`${a.date}T${a.time}`).getTime() >= Date.now())
        .slice(0, 10),
    [appts],
  );
  const history = useMemo(
    () =>
      appts
        .filter((a) => new Date(`${a.date}T${a.time}`).getTime() < Date.now())
        .slice(0, 20),
    [appts],
  );

  // form
  const [doctor, setDoctor] = useState("Dr. Emily Carter");
  const [type, setType] = useState("Consultation");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function submitRequest() {
    if (!date || !time || !doctor) {
      toast({
        title: "Missing fields",
        description: "Please select a doctor, date and time.",
      });
      return;
    }
    const a: Appt = { id: Date.now().toString(), date, time, doctor, type };
    setAppts((s) => [a, ...s]);
    toast({
      title: "Request submitted",
      description: `Appointment requested for ${date} ${time}`,
    });
    setDate("");
    setTime("");
  }

  function joinCall(id: string) {
    toast({
      title: "Joining call",
      description: "Opening telehealth link (mock)...",
    });
    // in real app, open meeting URL
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold mb-4">Appointments</h1>

          <h2 className="mb-3 text-lg font-medium">Upcoming Appointments</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.time}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.doctor}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.type}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => joinCall(a.id)}
                        className="text-sky-600 hover:underline"
                      >
                        Join Call
                      </button>
                    </td>
                  </tr>
                ))}
                {upcoming.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No upcoming appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 mb-3 text-lg font-medium">Appointment History</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.time}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.doctor}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {a.notes || "—"}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No past appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Request Appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Doctor</label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option>Dr. Emily Carter</option>
                  <option>Dr. Robert Harris</option>
                  <option>Dr. David Lee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option>Consultation</option>
                  <option>Check-up</option>
                  <option>Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600">Date</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600">Time</label>
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  type="time"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={submitRequest}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
