import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Activity, Smartwatch, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Vitals() {
  const [datetime, setDatetime] = useState<string>("");
  const [bp, setBp] = useState("");
  const [hr, setHr] = useState("");
  const [bg, setBg] = useState("");
  const [spO2, setSpO2] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");

  function handleSave() {
    if (!datetime) {
      toast({ title: "Missing date", description: "Please select date & time for the reading." });
      return;
    }

    // Simple validation example
    if (!bp && !hr && !bg && !spO2 && !weight) {
      toast({ title: "No vitals", description: "Please enter at least one vital value or sync from a wearable." });
      return;
    }

    // Mock save
    toast({ title: "Vitals saved", description: "Your vitals have been recorded." });

    // Clear form (optional)
    setBp("");
    setHr("");
    setBg("");
    setSpO2("");
    setWeight("");
    setSymptoms("");
  }

  function handleSync(source: string) {
    toast({ title: `Sync requested`, description: `Attempting to sync from ${source}...` });
    // mock autofill
    setTimeout(() => {
      setBp("120/80");
      setHr("72");
      setSpO2("98");
      toast({ title: `Synced`, description: `Data imported from ${source}.` });
    }, 800);
  }

  return (
    <MainLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6">Add Vitals</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date &amp; Time</label>
            <input value={datetime} onChange={(e) => setDatetime(e.target.value)} type="datetime-local" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Pressure (mmHg)</label>
            <input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="e.g., 120/80" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Heart Rate (bpm)</label>
            <input value={hr} onChange={(e) => setHr(e.target.value)} placeholder="e.g., 72" type="number" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Sugar (mg/dL)</label>
            <input value={bg} onChange={(e) => setBg(e.target.value)} placeholder="e.g., 100" type="number" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SpO2 (%)</label>
            <input value={spO2} onChange={(e) => setSpO2(e.target.value)} placeholder="e.g., 98" type="number" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (lbs)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 150" type="number" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={5} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-300" />
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-3">Sync from Wearables</div>
            <div className="flex gap-3">
              <button onClick={() => handleSync("Fitbit")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Activity className="h-4 w-4" /> Fitbit
              </button>
              <button onClick={() => handleSync("Google Fit")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Smartwatch className="h-4 w-4" /> Google Fit
              </button>
              <button onClick={() => handleSync("Apple Health")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Zap className="h-4 w-4" /> Apple Health
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700">Save &amp; Send</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
