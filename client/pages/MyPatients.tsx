import MainLayout from "@/components/layout/MainLayout";
import { Search, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorRequestManager from "@/lib/doctor-requests";
import { PatientDataStorage, PatientData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

interface Patient {
  email: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastUpdate: string;
  status: "Critical" | "Stable";
}

export default function MyPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Critical" | "Stable"
  >("All");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  // Load accepted patients and incoming requests
  useEffect(() => {
    if (user?.email) {
      // Get accepted patients
      const acceptedPatients = DoctorRequestManager.getAcceptedPatientsForDoctor(
        user.email,
      );

      const patientsWithDetails: Patient[] = acceptedPatients.map((acceptedPatient) => {
        const patientData = PatientDataStorage.getPatientData(acceptedPatient.email);
        const age = patientData ? parseInt(patientData.age) : 0;
        const gender = (patientData?.gender || "Other") as "Male" | "Female" | "Other";

        return {
          email: acceptedPatient.email,
          name: acceptedPatient.fullName,
          age,
          gender,
          lastUpdate: new Date().toLocaleDateString(),
          status: "Stable" as const,
        };
      });

      setPatients(patientsWithDetails);

      // Get pending requests
      const requests = DoctorRequestManager.getPendingRequestsForDoctor(
        user.email,
      );
      setIncomingRequests(requests);
    }
  }, [user?.email]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || patient.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, filterStatus]);

  function acceptRequest(requestId: string, patientEmail: string) {
    DoctorRequestManager.acceptRequest(requestId);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Request accepted",
      description: `You accepted ${patientEmail} as your patient.`,
    });
  }

  function rejectRequest(requestId: string, patientEmail: string) {
    DoctorRequestManager.rejectRequest(requestId);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Request rejected",
      description: `You rejected the request from ${patientEmail}.`,
    });
  }

  if (!user || user.role !== "Doctor") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search patients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-md border border-slate-200 bg-white/80 pl-11 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
            />
          </div>

          {/* Filter */}
          <div className="mt-3">
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <span>Filter</span>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "All" | "Critical" | "Stable",
                  )
                }
                className="border-none bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                <option value="All">All</option>
                <option value="Critical">Critical</option>
                <option value="Stable">Stable</option>
              </select>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
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
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Update
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredPatients.map((patient) => (
                  <tr key={patient.email} className="hover:bg-slate-50/40">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {patient.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {patient.age}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {patient.gender}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {patient.lastUpdate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          patient.status === "Critical"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/patient/${patient.email}`)}
                        className="text-sky-600 hover:text-sky-700 hover:underline"
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

        {filteredPatients.length === 0 && (
          <div className="mt-8 flex items-center justify-center py-12">
            <p className="text-slate-500">No patients found</p>
          </div>
        )}

        {/* Incoming Patient Requests */}
        {incomingRequests.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Incoming Patient Requests
              </h2>
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="text-sm text-sky-600 hover:underline"
              >
                {showRequests ? "Hide" : "Show"} ({incomingRequests.length})
              </button>
            </div>

            {showRequests && (
              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {request.patientEmail}
                        </div>
                        <div className="text-xs text-slate-600">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-2 rounded-md bg-white/50 p-2 text-xs text-slate-700">
                          <strong>Patient wants to connect with you on Vitals Vault</strong>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() =>
                            acceptRequest(request.id, request.patientEmail)
                          }
                          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button
                          onClick={() =>
                            rejectRequest(request.id, request.patientEmail)
                          }
                          className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
