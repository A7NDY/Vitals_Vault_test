import MainLayout from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Download, Phone } from "lucide-react";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  riskScore: number;
  vitals: {
    bloodPressure: { value: string; change: string };
    bloodSugar: { value: string; change: string };
    spO2: { value: string; change: string };
    heartRate: { value: string; change: string };
  };
}

const patientProfiles: Record<string, PatientData> = {
  "1": {
    id: "1",
    name: "Sophia Clark",
    age: 32,
    gender: "Female",
    contact: "(555) 123-4567",
    riskScore: 75,
    vitals: {
      bloodPressure: { value: "120/80 mmHg", change: "+2%" },
      bloodSugar: { value: "90 mg/dL", change: "-1%" },
      spO2: { value: "98%", change: "+0.5%" },
      heartRate: { value: "72 bpm", change: "-0.2%" },
    },
  },
  "2": {
    id: "2",
    name: "Ethan Bennett",
    age: 72,
    gender: "Male",
    contact: "(555) 234-5678",
    riskScore: 45,
    vitals: {
      bloodPressure: { value: "130/85 mmHg", change: "+1%" },
      bloodSugar: { value: "110 mg/dL", change: "+2%" },
      spO2: { value: "96%", change: "-0.3%" },
      heartRate: { value: "68 bpm", change: "-0.1%" },
    },
  },
  "3": {
    id: "3",
    name: "Olivia Hayes",
    age: 58,
    gender: "Female",
    contact: "(555) 345-6789",
    riskScore: 30,
    vitals: {
      bloodPressure: { value: "118/76 mmHg", change: "-1%" },
      bloodSugar: { value: "85 mg/dL", change: "-2%" },
      spO2: { value: "99%", change: "+0.2%" },
      heartRate: { value: "70 bpm", change: "+0.5%" },
    },
  },
  "4": {
    id: "4",
    name: "Liam Foster",
    age: 60,
    gender: "Male",
    contact: "(555) 456-7890",
    riskScore: 50,
    vitals: {
      bloodPressure: { value: "125/82 mmHg", change: "+0.5%" },
      bloodSugar: { value: "95 mg/dL", change: "-0.5%" },
      spO2: { value: "97%", change: "+0.1%" },
      heartRate: { value: "71 bpm", change: "+0.3%" },
    },
  },
  "5": {
    id: "5",
    name: "Ava Morgan",
    age: 68,
    gender: "Female",
    contact: "(555) 567-8901",
    riskScore: 55,
    vitals: {
      bloodPressure: { value: "128/80 mmHg", change: "+1.5%" },
      bloodSugar: { value: "100 mg/dL", change: "+1%" },
      spO2: { value: "96%", change: "-0.5%" },
      heartRate: { value: "74 bpm", change: "+0.2%" },
    },
  },
};

const tabs = [
  "Vitals Graphs",
  "Symptoms Log",
  "Medications",
  "Prescriptions",
  "Reports",
];

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Vitals Graphs");

  // Check access - only Doctor or Admin can view
  if (!user || (user.role !== "Doctor" && user.role !== "Admin")) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  const patient = id ? patientProfiles[id] : null;

  if (!patient) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-slate-600">Patient not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sky-600 hover:text-sky-700 underline"
          >
            Go back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Overview</h1>
          <p className="text-slate-600">
            Manage patient health data and interactions
          </p>
        </div>

        {/* Patient Profile Card + Video Call */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-6">
                <img
                  src={`https://i.pravatar.cc/150?img=${parseInt(patient.id) * 10}`}
                  alt={patient.name}
                  className="h-24 w-24 rounded-full border-2 border-slate-200"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {patient.gender}, {patient.age} years old
                  </p>
                  <p className="text-sm text-slate-600">
                    Contact: {patient.contact}
                  </p>

                  {/* AI Risk Score */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        AI Risk Score
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {patient.riskScore}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${patient.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Call Button */}
          <div className="flex items-start">
            <button className="w-full rounded-lg bg-sky-500 px-6 py-3 text-center font-medium text-white hover:bg-sky-600">
              Start Video Call
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-sky-500 text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Vitals Graphs Tab */}
        {activeTab === "Vitals Graphs" && (
          <div>
            {/* Time Period Selection */}
            <div className="mb-6 flex gap-3">
              <button className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Last 3 Months
              </button>
              <button className="rounded-md border bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                Last 6 Months
              </button>
            </div>

            <h3 className="mb-6 text-lg font-semibold text-slate-900">
              Vitals Graphs
            </h3>

            {/* Vitals Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              {/* Blood Pressure */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-600">Blood Pressure</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {patient.vitals.bloodPressure.value}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Last 3 Months{" "}
                  <span
                    className={`${
                      patient.vitals.bloodPressure.change.startsWith("+")
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {patient.vitals.bloodPressure.change}
                  </span>
                </div>
                <svg
                  className="mt-4 h-20 w-full text-slate-300"
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    points="0,18 20,14 40,18 60,8 80,12 100,20 120,10"
                  />
                </svg>
                <div className="mt-4 flex justify-between text-xs text-slate-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                </div>
              </div>

              {/* Blood Sugar */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-600">Blood Sugar</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {patient.vitals.bloodSugar.value}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Last 3 Months{" "}
                  <span
                    className={`${
                      patient.vitals.bloodSugar.change.startsWith("+")
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {patient.vitals.bloodSugar.change}
                  </span>
                </div>
                <svg
                  className="mt-4 h-20 w-full text-slate-300"
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    points="0,18 20,14 40,18 60,8 80,12 100,20 120,10"
                  />
                </svg>
                <div className="mt-4 flex justify-between text-xs text-slate-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-600">SpO₂</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {patient.vitals.spO2.value}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Last 3 Months{" "}
                  <span
                    className={`${
                      patient.vitals.spO2.change.startsWith("+")
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {patient.vitals.spO2.change}
                  </span>
                </div>
                <svg
                  className="mt-4 h-20 w-full text-slate-300"
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    points="0,18 20,14 40,18 60,8 80,12 100,20 120,10"
                  />
                </svg>
                <div className="mt-4 flex justify-between text-xs text-slate-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-600">Heart Rate</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {patient.vitals.heartRate.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Last 3 Months{" "}
                <span
                  className={`${
                    patient.vitals.heartRate.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {patient.vitals.heartRate.change}
                </span>
              </div>
              <svg
                className="mt-6 h-32 w-full text-slate-300"
                viewBox="0 0 120 32"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  points="0,20 10,18 20,12 30,8 40,10 50,6 60,4 70,8 80,15 90,18 100,16 110,12 120,10"
                />
              </svg>
              <div className="mt-6 flex justify-between text-xs text-slate-500">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab !== "Vitals Graphs" && (
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">
              {activeTab} content coming soon
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export as PDF
          </button>
          <button className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
            Schedule Checkup
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
