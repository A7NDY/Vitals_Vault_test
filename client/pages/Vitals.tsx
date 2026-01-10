import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Activity, Zap, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import VitalsAnalyzer, { VitalAnalysis, PatientBaseline } from "@/lib/vitals-analysis";
import { PatientDataStorage } from "@/lib/storage";

export default function Vitals() {
  const { user } = useAuth();
  const [datetime, setDatetime] = useState<string>("");
  const [bp, setBp] = useState("");
  const [hr, setHr] = useState("");
  const [bg, setBg] = useState("");
  const [spO2, setSpO2] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [analysisResults, setAnalysisResults] = useState<VitalAnalysis[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [saved, setSaved] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem("vv_vitals");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Load patient baseline data
  const [patientData, setPatientData] = useState<PatientBaseline | null>(null);

  useEffect(() => {
    if (user?.email) {
      const data = PatientDataStorage.getPatientData(user.email);
      if (data) {
        setPatientData({
          age: parseInt(data.age),
          gender: data.gender as "Male" | "Female" | "Other",
          chronicConditions: data.chronicConditions,
          baselineHeartRate: undefined,
          baselineSystolicBP: undefined,
          baselineDiastolicBP: undefined,
          baselineSpO2: undefined,
        });
      }
    }
  }, [user?.email]);

  function persist(records: any[]) {
    try {
      localStorage.setItem("vv_vitals", JSON.stringify(records));
    } catch (e) {
      // ignore
    }
  }

  function handleSave() {
    if (!datetime) {
      toast({ title: "Missing date", description: "Please select date & time for the reading." });
      return;
    }

    if (!bp && !hr && !bg && !spO2 && !weight) {
      toast({ title: "No vitals", description: "Please enter at least one vital value or sync from a wearable." });
      return;
    }

    // Parse BP (format: 120/80)
    let systolicBP: number | undefined;
    let diastolicBP: number | undefined;
    if (bp) {
      const [sbp, dbp] = bp.split("/").map((x) => parseInt(x));
      if (!isNaN(sbp)) systolicBP = sbp;
      if (!isNaN(dbp)) diastolicBP = dbp;
    }

    const record = {
      id: Date.now().toString(),
      datetime,
      bp: bp || null,
      systolicBP,
      diastolicBP,
      hr: hr ? parseInt(hr) : null,
      bg: bg ? parseInt(bg) : null,
      spO2: spO2 ? parseInt(spO2) : null,
      weight: weight ? parseInt(weight) : null,
      symptoms: symptoms || null,
      analysis: [] as VitalAnalysis[],
    };

    // Run vitals analysis
    if (patientData) {
      const analyses = VitalsAnalyzer.analyzeAllVitals(
        {
          id: record.id,
          timestamp: datetime,
          heartRate: record.hr || undefined,
          systolicBP: record.systolicBP,
          diastolicBP: record.diastolicBP,
          spO2: record.spO2,
          weight: record.weight,
          bloodSugar: record.bg || undefined,
          symptoms: record.symptoms || undefined,
        },
        patientData,
      );
      record.analysis = analyses;
      setAnalysisResults(analyses);
      setShowAnalysis(true);

      // Create alert if there are warnings or critical
      if (VitalsAnalyzer.hasAlerts(analyses)) {
        const severity = VitalsAnalyzer.getHighestSeverity(analyses);
        createDoctorAlert(record, analyses, user?.email);
      }
    }

    const next = [record, ...saved].slice(0, 50);
    setSaved(next);
    persist(next);

    toast({ title: "Vitals saved", description: "Your vitals have been recorded and analyzed." });

    setDatetime("");
    setBp("");
    setHr("");
    setBg("");
    setSpO2("");
    setWeight("");
    setSymptoms("");
  }

  function createDoctorAlert(record: any, analyses: VitalAnalysis[], patientEmail?: string) {
    if (!patientEmail) return;

    // Get all doctor alerts from localStorage
    const alertsKey = "vv_doctor_alerts";
    let alerts: any[] = [];
    try {
      const raw = localStorage.getItem(alertsKey);
      alerts = raw ? JSON.parse(raw) : [];
    } catch (e) {
      alerts = [];
    }

    // Create alert entry
    const alert = {
      id: Date.now().toString(),
      patientEmail,
      timestamp: new Date().toISOString(),
      readingTime: record.datetime,
      severity: VitalsAnalyzer.getHighestSeverity(analyses),
      vitals: {
        bp: record.bp,
        hr: record.hr,
        spO2: record.spO2,
        bloodSugar: record.bg,
      },
      analyses: analyses.filter((a) => a.status !== "Normal"),
      message: `Patient ${patientEmail} has out-of-range vitals requiring attention.`,
      read: false,
    };

    // Add to alerts and persist
    const updated = [alert, ...alerts].slice(0, 100);
    try {
      localStorage.setItem(alertsKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving alert:", e);
    }
  }

  function handleSync(source: string) {
    toast({ title: `Sync requested`, description: `Attempting to sync from ${source}...` });
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
                <Activity className="h-4 w-4" /> Google Fit
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

        {/* Analysis Results */}
        {showAnalysis && analysisResults.length > 0 && (
          <div className="mt-8 rounded-lg border-2 border-sky-200 bg-sky-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 Vitals Analysis</h2>
            <div className="space-y-4">
              {analysisResults.map((analysis) => {
                const isNormal = analysis.status === "Normal";
                const isWarning = analysis.status === "Warning";
                const isCritical = analysis.status === "Critical";

                return (
                  <div
                    key={analysis.vital}
                    className={`rounded-md p-4 ${
                      isCritical
                        ? "border-l-4 border-red-600 bg-red-50"
                        : isWarning
                          ? "border-l-4 border-orange-600 bg-orange-50"
                          : "border-l-4 border-green-600 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isCritical && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {isWarning && <AlertCircle className="h-5 w-5 text-orange-600" />}
                        {isNormal && <div className="h-5 w-5 rounded-full bg-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900">{analysis.vital}</div>
                          <div
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              isCritical
                                ? "bg-red-100 text-red-800"
                                : isWarning
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {analysis.status}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-700">
                          <div>
                            <strong>Current:</strong> {analysis.currentValue}
                            {analysis.vital.includes("Pressure") ? " mmHg" : analysis.vital === "Oxygen Saturation" ? "%" : ""}
                          </div>
                          <div>
                            <strong>Normal Range:</strong> {analysis.lowerLimit.toFixed(1)}-{analysis.upperLimit.toFixed(1)}
                            {analysis.vital.includes("Pressure") ? " mmHg" : analysis.vital === "Oxygen Saturation" ? "%" : ""}
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <div className="text-slate-700">{analysis.reason}</div>
                          <div className={`mt-2 font-medium ${isCritical ? "text-red-700" : isWarning ? "text-orange-700" : "text-green-700"}`}>
                            {analysis.recommendedAction}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent entries */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Vitals</h2>
          <div className="space-y-3">
            {saved.length === 0 && <div className="text-sm text-slate-500">No vitals recorded yet.</div>}
            {saved.map((r) => {
              const hasCritical = r.analysis?.some((a: VitalAnalysis) => a.status === "Critical");
              const hasWarning = r.analysis?.some((a: VitalAnalysis) => a.status === "Warning");
              const hasAnalysis = r.analysis && r.analysis.length > 0;

              return (
                <div
                  key={r.id}
                  className={`rounded-md border p-3 ${
                    hasCritical
                      ? "border-red-300 bg-red-50"
                      : hasWarning
                        ? "border-orange-300 bg-orange-50"
                        : hasAnalysis
                          ? "border-green-300 bg-green-50"
                          : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{new Date(r.datetime).toLocaleString()}</div>
                      <div className="mt-1 text-sm text-slate-600">BP: {r.bp || "—"} • HR: {r.hr || "—"} • SpO2: {r.spO2 || "—"}</div>
                    </div>
                    {hasCritical && (
                      <div className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-bold text-red-700">CRITICAL</span>
                      </div>
                    )}
                    {hasWarning && !hasCritical && (
                      <div className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-bold text-orange-700">WARNING</span>
                      </div>
                    )}
                  </div>
                  {hasAnalysis && (
                    <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                      <div className="text-xs text-slate-600">
                        {r.analysis.map((a: VitalAnalysis) => (
                          <div key={a.vital}>• {a.vital}: {a.status}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
