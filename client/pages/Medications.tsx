import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Med = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // e.g. "08:00"
  status: "Active" | "Paused";
  refillInDays: number;
};

const SAMPLE: Med[] = [
  { id: "m1", name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "08:00", status: "Active", refillInDays: 7 },
  { id: "m2", name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "09:00", status: "Active", refillInDays: 14 },
  { id: "m3", name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", time: "22:00", status: "Active", refillInDays: 3 },
];

function loadMeds() {
  try {
    const raw = localStorage.getItem("vv_meds");
    return raw ? (JSON.parse(raw) as Med[]) : SAMPLE;
  } catch (e) {
    return SAMPLE;
  }
}

function persistMeds(meds: Med[]) {
  try {
    localStorage.setItem("vv_meds", JSON.stringify(meds));
  } catch (e) {
    // ignore
  }
}

function secondsToHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return { h, m, s };
}

export default function Medications() {
  const [meds, setMeds] = useState<Med[]>(() => loadMeds());

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  const [refillInDays, setRefillInDays] = useState<number>(30);

  useEffect(() => persistMeds(meds), [meds]);

  function addMed() {
    if (!name || !dosage || !frequency || !time) {
      toast({ title: "Missing fields", description: "Please complete all medicine fields." });
      return;
    }
    const m: Med = { id: Date.now().toString(), name, dosage, frequency, time, status: "Active", refillInDays };
    const next = [m, ...meds];
    setMeds(next);
    setName("");
    setDosage("");
    setFrequency("");
    setTime("");
    setRefillInDays(30);
    toast({ title: "Added", description: `${m.name} added to your schedule.` });
  }

  function toggleStatus(id: string) {
    setMeds((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "Active" ? "Paused" : "Active" } : p)));
  }

  function removeMed(id: string) {
    const med = meds.find((m) => m.id === id);
    setMeds((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Removed", description: `${med?.name} removed from your schedule.` });
  }

  function upcomingSeconds(nextTime: string) {
    const now = new Date();
    const [hh, mm] = nextTime.split(":").map(Number);
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm || 0, 0);
    if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);
    return Math.max(0, Math.floor((candidate.getTime() - now.getTime()) / 1000));
  }

  const nextDose = useMemo(() => {
    if (meds.length === 0) return { seconds: 0, med: null };
    let best = { seconds: Infinity, med: null as Med | null };
    for (const m of meds) {
      if (m.status !== "Active") continue;
      const s = upcomingSeconds(m.time);
      if (s < best.seconds) best = { seconds: s, med: m };
    }
    return best;
  }, [meds]);

  const refillReminders = useMemo(() => meds.filter((m) => m.refillInDays <= 30).slice(0, 5), [meds]);

  const nextHms = secondsToHMS(nextDose.seconds === Infinity ? 0 : nextDose.seconds);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold mb-4">Medication Schedule</h1>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Dosage</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meds.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="py-3 px-4 text-sm text-slate-700">{m.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{m.dosage}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{m.frequency}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{m.time}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${m.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(m.id)} className="text-sky-600 hover:underline">{m.status === "Active" ? "Pause" : "Resume"}</button>
                        <button onClick={() => removeMed(m.id)} className="text-rose-600 hover:text-rose-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-6 text-lg font-medium">Add New Medication</h2>
          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Medicine Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="Enter medicine name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Dosage</label>
              <input value={dosage} onChange={(e) => setDosage(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="e.g., 500mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Frequency</label>
              <input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="e.g., Once daily" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Time</label>
              <input value={time} onChange={(e) => setTime(e.target.value)} type="time" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Refill (days)</label>
              <input value={refillInDays} onChange={(e) => setRefillInDays(Number(e.target.value))} type="number" className="mt-2 w-40 rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-end">
              <button onClick={addMed} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white">Add Medication</button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">Upcoming Doses</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xl font-semibold">{String(nextHms.h).padStart(2, "0")}</div>
                <div className="text-xs text-slate-500">Hours</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xl font-semibold">{String(nextHms.m).padStart(2, "0")}</div>
                <div className="text-xs text-slate-500">Minutes</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xl font-semibold">{String(nextHms.s).padStart(2, "0")}</div>
                <div className="text-xs text-slate-500">Seconds</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">{nextDose.med ? `${nextDose.med.name} - ${nextDose.med.dosage}` : "No upcoming doses"}</div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Refill Reminders</div>
            <ul className="mt-4 space-y-3">
              {refillReminders.length === 0 && <li className="text-sm text-slate-500">No refills soon</li>}
              {refillReminders.map((r) => (
                <li key={r.id} className="flex items-start gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-slate-50">🔁</div>
                  <div>
                    <div className="text-sm font-medium">Refill due in {r.refillInDays} days</div>
                    <div className="text-sm text-slate-500">{r.name} - {r.dosage}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
