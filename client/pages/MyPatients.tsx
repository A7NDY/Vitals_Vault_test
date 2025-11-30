import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  lastUpdate: string;
  status: "Critical" | "Stable";
}

const patientsData: Patient[] = [
  {
    id: "1",
    name: "Sophia Carter",
    age: 65,
    gender: "Female",
    lastUpdate: "2023-11-15",
    status: "Critical",
  },
  {
    id: "2",
    name: "Ethan Bennett",
    age: 72,
    gender: "Male",
    lastUpdate: "2023-11-18",
    status: "Stable",
  },
  {
    id: "3",
    name: "Olivia Hayes",
    age: 58,
    gender: "Female",
    lastUpdate: "2023-11-20",
    status: "Stable",
  },
  {
    id: "4",
    name: "Liam Foster",
    age: 60,
    gender: "Male",
    lastUpdate: "2023-11-17",
    status: "Stable",
  },
  {
    id: "5",
    name: "Ava Morgan",
    age: 68,
    gender: "Female",
    lastUpdate: "2023-11-19",
    status: "Stable",
  },
  {
    id: "6",
    name: "Noah Parker",
    age: 75,
    gender: "Male",
    lastUpdate: "2023-11-16",
    status: "Stable",
  },
  {
    id: "7",
    name: "Isabella Reed",
    age: 62,
    gender: "Female",
    lastUpdate: "2023-11-21",
    status: "Stable",
  },
  {
    id: "8",
    name: "Jackson Cole",
    age: 69,
    gender: "Male",
    lastUpdate: "2023-11-22",
    status: "Stable",
  },
  {
    id: "9",
    name: "Mia Hughes",
    age: 55,
    gender: "Female",
    lastUpdate: "2023-11-23",
    status: "Stable",
  },
  {
    id: "10",
    name: "Aiden Brooks",
    age: 70,
    gender: "Male",
    lastUpdate: "2023-11-24",
    status: "Stable",
  },
];

export default function MyPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Critical" | "Stable">("All");

  const filteredPatients = useMemo(() => {
    return patientsData.filter((patient) => {
      const matchesSearch = patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || patient.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

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
                  setFilterStatus(e.target.value as "All" | "Critical" | "Stable")
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
                  <tr key={patient.id} className="hover:bg-slate-50/40">
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
                        onClick={() => navigate(`/patient/${patient.id}`)}
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
      </div>
    </MainLayout>
  );
}
