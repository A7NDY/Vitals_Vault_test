import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DoctorAppt {
  id: string;
  patient: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "Check-up" | "Consultation" | "Follow-up";
  notes: string;
}

const SAMPLE_APPTS: DoctorAppt[] = [
  {
    id: "1",
    patient: "Ava Thompson",
    date: "2024-09-15",
    time: "09:00",
    type: "Check-up",
    notes: "Patient is doing well, continue current medication.",
  },
  {
    id: "2",
    patient: "Ethan Walker",
    date: "2024-08-20",
    time: "13:00",
    type: "Consultation",
    notes: "Discussed treatment options, scheduled follow-up.",
  },
  {
    id: "3",
    patient: "Liam Harper",
    date: "2024-10-28",
    time: "10:00",
    type: "Check-up",
    notes: "",
  },
  {
    id: "4",
    patient: "Olivia Bennett",
    date: "2024-11-01",
    time: "14:30",
    type: "Consultation",
    notes: "",
  },
  {
    id: "5",
    patient: "Noah Carter",
    date: "2024-11-15",
    time: "11:00",
    type: "Follow-up",
    notes: "",
  },
];

const PATIENTS = [
  "Ava Thompson",
  "Ethan Walker",
  "Liam Harper",
  "Olivia Bennett",
  "Noah Carter",
  "Sophia Clark",
  "Isabella Reed",
  "Jackson Cole",
];

function loadDoctorAppts() {
  try {
    const raw = localStorage.getItem("vv_doctor_appts");
    return raw ? (JSON.parse(raw) as DoctorAppt[]) : SAMPLE_APPTS;
  } catch (e) {
    return SAMPLE_APPTS;
  }
}

function persistDoctorAppts(appts: DoctorAppt[]) {
  try {
    localStorage.setItem("vv_doctor_appts", JSON.stringify(appts));
  } catch (e) {
    // ignore
  }
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<DoctorAppt[]>(() => loadDoctorAppts());
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 4)); // Oct 4, 2024
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form states
  const [formPatient, setFormPatient] = useState("Ava Thompson");
  const [formType, setFormType] = useState<"Check-up" | "Consultation" | "Follow-up">("Check-up");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => persistDoctorAppts(appts), [appts]);

  if (!user || user.role !== "Doctor") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const pastAppts = useMemo(
    () =>
      appts
        .filter((a) => new Date(`${a.date}T${a.time}`).getTime() < Date.now())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appts],
  );

  const upcomingAppts = useMemo(
    () =>
      appts
        .filter((a) => new Date(`${a.date}T${a.time}`).getTime() >= Date.now())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [appts],
  );

  function handleSubmitRequest() {
    if (!formDate || !formTime || !formPatient) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const newAppt: DoctorAppt = {
      id: Date.now().toString(),
      patient: formPatient,
      date: formDate,
      time: formTime,
      type: formType,
      notes: formNotes,
    };

    setAppts((prev) => [newAppt, ...prev]);
    toast({
      title: "Appointment created",
      description: `Appointment with ${formPatient} scheduled for ${new Date(formDate).toLocaleDateString()} at ${formTime}`,
    });

    // Reset form
    setFormDate("");
    setFormTime("");
    setFormNotes("");
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Sidebar - Calendar & Upcoming */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Calendar */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-slate-900">
                  {monthName}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs font-medium text-slate-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dateKey = day
                    ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                    : `empty-${idx}`;
                  return (
                    <button
                      key={dateKey}
                      onClick={() => {
                        if (day) {
                          const dateStr = formatDate(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day,
                          );
                          setSelectedDate(dateStr);
                        }
                      }}
                      disabled={!day}
                      className={`h-8 text-sm rounded flex items-center justify-center ${
                        !day
                          ? "text-slate-300"
                          : selectedDate ===
                              formatDate(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                day,
                              )
                            ? "bg-sky-500 text-white font-semibold"
                            : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">
              Upcoming Appointments
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {upcomingAppts.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppts.map((apt) => (
                  <div key={apt.id} className="border-b pb-2 last:border-b-0">
                    <p className="text-xs font-medium text-slate-900">
                      {apt.patient}
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(apt.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-600">{apt.time}</p>
                    <p className="text-xs text-slate-500 mt-1">{apt.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>

          {/* Past Appointments */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Past Appointments
            </h2>
            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/60 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Doctor Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pastAppts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-slate-500"
                        >
                          No past appointments
                        </td>
                      </tr>
                    ) : (
                      pastAppts.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {apt.patient}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(apt.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {apt.time}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {apt.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {apt.notes || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Request Appointment Form */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Request Appointment
            </h2>
            <div className="rounded-lg border bg-white p-6 shadow-sm max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Patient
                  </label>
                  <select
                    value={formPatient}
                    onChange={(e) => setFormPatient(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                  >
                    {PATIENTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date (MM/DD/YYYY)
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Time (HH:MM AM/PM)
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                      placeholder="HH:MM AM/PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(e.target.value as typeof formType)
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                  >
                    <option value="Check-up">Check-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Doctor Notes
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={4}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-400 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitRequest}
                    className="rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
