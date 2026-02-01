import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { AlertTriangle, AlertCircle, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { PatientDataStorage } from "@/lib/storage";

interface DoctorAlert {
  id: string;
  patientEmail: string;
  patientName?: string;
  timestamp: string;
  readingTime: string;
  severity: "Normal" | "Warning" | "Critical";
  vitals: {
    bp?: string;
    hr?: number;
    spO2?: number;
    bloodSugar?: number;
  };
  analyses: Array<{
    vital: string;
    status: string;
    reason: string;
    recommendedAction: string;
  }>;
  message: string;
  read: boolean;
}

export default function DoctorAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<DoctorAlert[]>([]);
  const [filter, setFilter] = useState<"All" | "Critical" | "Warning" | "Unread">("All");

  useEffect(() => {
    loadAlerts();
  }, []);

  function loadAlerts() {
    try {
      const raw = localStorage.getItem("vv_doctor_alerts");
      const allAlerts = raw ? JSON.parse(raw) : [];
      setAlerts(allAlerts);
    } catch (e) {
      console.error("Error loading alerts:", e);
    }
  }

  function markAsRead(alertId: string) {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert)),
    );

    try {
      const updated = alerts.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert));
      localStorage.setItem("vv_doctor_alerts", JSON.stringify(updated));
    } catch (e) {
      console.error("Error updating alert:", e);
    }
  }

  function dismissAlert(alertId: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));

    try {
      const updated = alerts.filter((alert) => alert.id !== alertId);
      localStorage.setItem("vv_doctor_alerts", JSON.stringify(updated));
    } catch (e) {
      console.error("Error dismissing alert:", e);
    }

    toast({ title: "Alert dismissed", description: "The alert has been removed." });
  }

  const alertsWithNames = useMemo(() => {
    return alerts.map((alert) => {
      if (!alert.patientName) {
        const patientData = PatientDataStorage.getPatientData(alert.patientEmail);
        return {
          ...alert,
          patientName: patientData?.fullName || alert.patientEmail.split("@")[0],
        };
      }
      return alert;
    });
  }, [alerts]);

  const filteredAlerts = alertsWithNames.filter((alert) => {
    if (filter === "Critical") return alert.severity === "Critical";
    if (filter === "Warning") return alert.severity === "Warning";
    if (filter === "Unread") return !alert.read;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.severity === "Critical").length;
  const warningCount = alerts.filter((a) => a.severity === "Warning").length;

  return (
    <MainLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Vitals Alerts</h1>
          <p className="mt-2 text-slate-600">
            Monitor and manage alerts from your patients' vitals readings.
          </p>
        </div>

        {/* Alert Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Critical Alerts</div>
            <div className="mt-2 text-2xl font-bold text-red-600">{criticalCount}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Warnings</div>
            <div className="mt-2 text-2xl font-bold text-orange-600">{warningCount}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-600">Unread</div>
            <div className="mt-2 text-2xl font-bold text-sky-600">{unreadCount}</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          {(["All", "Critical", "Warning", "Unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-sky-600 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center">
              <div className="text-sm text-slate-600">
                {filter === "All"
                  ? "No alerts yet. All your patients are doing well!"
                  : `No ${filter.toLowerCase()} alerts.`}
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === "Critical";
              const isWarning = alert.severity === "Warning";

              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    !alert.read ? "border-l-4" : ""
                  } ${
                    isCritical
                      ? "border-red-300 bg-red-50"
                      : isWarning
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {isCritical && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {isWarning && <AlertCircle className="h-5 w-5 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">
                              {alert.patientName || alert.patientEmail}
                            </div>
                            <div className="text-xs text-slate-600">
                              {alert.patientEmail}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Reading: {new Date(alert.readingTime).toLocaleString()}
                            </div>
                          </div>
                          {!alert.read && (
                            <div className="ml-auto">
                              <span className="inline-block h-2 w-2 rounded-full bg-sky-600"></span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 rounded-md bg-white/50 p-3">
                          <div className="text-sm font-medium text-slate-700 mb-2">Vitals Reading:</div>
                          <div className="grid gap-1 text-sm text-slate-600">
                            {alert.vitals.bp && <div>• Blood Pressure: {alert.vitals.bp}</div>}
                            {alert.vitals.hr && <div>• Heart Rate: {alert.vitals.hr} bpm</div>}
                            {alert.vitals.spO2 && <div>• SpO2: {alert.vitals.spO2}%</div>}
                            {alert.vitals.bloodSugar && <div>• Blood Sugar: {alert.vitals.bloodSugar} mg/dL</div>}
                          </div>
                        </div>

                        {alert.analyses.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {alert.analyses.map((analysis) => (
                              <div key={analysis.vital} className="text-sm">
                                <div className="font-medium text-slate-700">
                                  {analysis.vital}
                                  <span
                                    className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
                                      analysis.status === "Critical"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {analysis.status}
                                  </span>
                                </div>
                                <div className="text-slate-600">{analysis.reason}</div>
                                <div className="mt-1 font-medium text-slate-700">
                                  ⚕️ {analysis.recommendedAction}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="flex items-center gap-1 rounded-md border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
                        >
                          <Check className="h-3 w-3" /> Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
