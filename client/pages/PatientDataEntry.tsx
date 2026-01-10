import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { PatientDataStorage, PatientData } from "@/lib/storage";
import { X } from "lucide-react";

export default function PatientDataEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialData: PatientData = {
    age: "",
    gender: "",
    height: "",
    weight: "",
    bmi: "",
    bloodGroup: "",
    chronicConditions: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      asthmaOrCOPD: false,
    },
    pastSurgeries: "",
    ongoingConditions: "",
    familyHistory: "",
    pregnancyStatus: "Not Applicable / No",
    medications: [],
  };

  const [data, setData] = useState<PatientData>(initialData);

  function calculateBMI(h: string, w: string) {
    if (!h || !w) return "";
    const heightM = parseInt(h) / 100;
    const weightKg = parseInt(w);
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);

    let category = "";
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) category = "Underweight";
    else if (bmiNum < 25) category = "Normal";
    else if (bmiNum < 30) category = "Overweight";
    else category = "Obese";

    return `${bmi} (${category})`;
  }

  function handleHeightChange(value: string) {
    setData((prev) => ({
      ...prev,
      height: value,
      bmi: calculateBMI(value, prev.weight),
    }));
  }

  function handleWeightChange(value: string) {
    setData((prev) => ({
      ...prev,
      weight: value,
      bmi: calculateBMI(prev.height, value),
    }));
  }

  function handleChronicConditionChange(condition: keyof typeof data.chronicConditions) {
    setData((prev) => ({
      ...prev,
      chronicConditions: {
        ...prev.chronicConditions,
        [condition]: !prev.chronicConditions[condition],
      },
    }));
  }

  function addMedication() {
    const newMed = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "Once Daily",
      duration: "",
    };
    setData((prev) => ({
      ...prev,
      medications: [...prev.medications, newMed],
    }));
  }

  function updateMedication(id: string, field: string, value: string) {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    }));
  }

  function removeMedication(id: string) {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  }

  function handleSave() {
    if (!data.age || !data.gender || !data.height || !data.weight || !data.bloodGroup) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Age, Gender, Height, Weight, and Blood Group.",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "Unable to save data. User not found.",
      });
      return;
    }

    PatientDataStorage.savePatientData(user.email, data);
    toast({
      title: "Success",
      description: "Your health information has been saved.",
    });

    setTimeout(() => {
      navigate("/patients");
    }, 800);
  }

  function handleSkip() {
    navigate("/patients");
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Data Entry</h1>
          <p className="mt-2 text-slate-600">
            Complete the sections below to set up your patient record.
          </p>
        </div>

        {/* Section 1: Physical & Demographic Details */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              👤
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Section 1: Physical & Demographic Details
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Height (cm)
              </label>
              <input
                type="number"
                value={data.height}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder="e.g. 180"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Weight (kg)
              </label>
              <input
                type="number"
                value={data.weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="e.g. 75"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              />
            </div>

            {/* BMI */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                BMI (Auto-calculated)
              </label>
              <input
                type="text"
                value={data.bmi}
                disabled
                className="mt-1 w-full rounded-md border border-slate-200 bg-blue-50 px-3 py-2 text-sm font-medium text-sky-700"
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Blood Group
              </label>
              <select
                value={data.bloodGroup}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, bloodGroup: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Medical History */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              ⏱️
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Section 2: Medical History
            </h2>
          </div>

          {/* Chronic Conditions */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Chronic Conditions
            </label>
            <div className="space-y-2">
              {[
                { key: "diabetes", label: "Diabetes" },
                { key: "hypertension", label: "Hypertension" },
                { key: "heartDisease", label: "Heart Disease" },
                { key: "asthmaOrCOPD", label: "Asthma/COPD" },
              ].map((condition) => (
                <label key={condition.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      data.chronicConditions[
                        condition.key as keyof typeof data.chronicConditions
                      ]
                    }
                    onChange={() =>
                      handleChronicConditionChange(
                        condition.key as keyof typeof data.chronicConditions,
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Past Surgeries */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Past Surgeries
            </label>
            <textarea
              value={data.pastSurgeries}
              onChange={(e) =>
                setData((prev) => ({ ...prev, pastSurgeries: e.target.value }))
              }
              placeholder="List any previous surgical procedures..."
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Ongoing Conditions */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Ongoing Conditions
            </label>
            <textarea
              value={data.ongoingConditions}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  ongoingConditions: e.target.value,
                }))
              }
              placeholder="Describe any current health issues..."
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Family History */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Family History
            </label>
            <textarea
              value={data.familyHistory}
              onChange={(e) =>
                setData((prev) => ({ ...prev, familyHistory: e.target.value }))
              }
              placeholder="Mention any hereditary conditions..."
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Pregnancy Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Pregnancy Status
            </label>
            <div className="mt-2 space-y-2">
              {[
                { value: "Not Applicable / No", label: "Not Applicable / No" },
                { value: "Yes", label: "Yes" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pregnancy"
                    value={option.value}
                    checked={data.pregnancyStatus === option.value}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        pregnancyStatus: e.target.value as "Not Applicable / No" | "Yes",
                      }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Current Medications */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                💊
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Section 3: Current Medications
              </h2>
            </div>
            <button
              onClick={addMedication}
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              + Add Medicine
            </button>
          </div>

          {data.medications.length === 0 ? (
            <p className="text-sm text-slate-500">No medications added yet.</p>
          ) : (
            <div className="space-y-4">
              {data.medications.map((med) => (
                <div key={med.id} className="rounded-md border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-700">
                      Medicine Entry
                    </h3>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        MEDICINE NAME
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) =>
                          updateMedication(med.id, "name", e.target.value)
                        }
                        placeholder="e.g. Aspirin"
                        className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        DOSAGE
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) =>
                          updateMedication(med.id, "dosage", e.target.value)
                        }
                        placeholder="e.g. 500mg"
                        className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        FREQUENCY
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedication(med.id, "frequency", e.target.value)
                        }
                        className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
                      >
                        <option>Once Daily</option>
                        <option>Twice Daily</option>
                        <option>Three Times Daily</option>
                        <option>As Needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        DURATION
                      </label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) =>
                          updateMedication(med.id, "duration", e.target.value)
                        }
                        placeholder="e.g. 3 months"
                        className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
          >
            💾 Save Patient Record
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
