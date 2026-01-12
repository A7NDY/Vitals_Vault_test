import { useState, useMemo, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import DoctorRequestManager from "@/lib/doctor-requests";
import { Search, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PatientReport {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string; // YYYY-MM-DD
  reportType:
    | "Blood Test"
    | "MRI Scan"
    | "ECG"
    | "X-Ray"
    | "Ultrasound"
    | "CT Scan"
    | "Physical Exam";
}

function loadDoctorReports() {
  try {
    const raw = localStorage.getItem("vv_doctor_reports");
    return raw ? (JSON.parse(raw) as PatientReport[]) : [];
  } catch (e) {
    return [];
  }
}

function persistDoctorReports(reports: PatientReport[]) {
  try {
    localStorage.setItem("vv_doctor_reports", JSON.stringify(reports));
  } catch (e) {
    // ignore
  }
}

export default function DoctorReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PatientReport[]>(() =>
    loadDoctorReports(),
  );
  const [connectedPatients, setConnectedPatients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load connected patients
  useEffect(() => {
    if (user?.email) {
      const patients = DoctorRequestManager.getAcceptedPatientsForDoctor(user.email);
      setConnectedPatients(new Set(patients.map((p) => p.email)));
    }
  }, [user?.email]);

  if (!user || user.role !== "Doctor") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Access denied</p>
        </div>
      </MainLayout>
    );
  }

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Only show reports for connected patients
      const isConnectedPatient = connectedPatients.has(report.patientEmail);

      const matchesSearch = report.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesDateRange = true;
      if (startDate) {
        matchesDateRange = matchesDateRange && report.date >= startDate;
      }
      if (endDate) {
        matchesDateRange = matchesDateRange && report.date <= endDate;
      }

      return isConnectedPatient && matchesSearch && matchesDateRange;
    });
  }, [reports, connectedPatients, searchTerm, startDate, endDate]);

  function handleGenerateReport() {
    toast({
      title: "Generating report",
      description: "The new report is being generated...",
    });
  }

  function handleDownload(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      toast({
        title: "Download started",
        description: `${report.reportType} for ${report.patientName} is downloading...`,
      });
    }
  }

  function handleExportWeek() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekReports = reports.filter(
      (r) => new Date(r.date) >= weekAgo && new Date(r.date) <= today,
    );
    toast({
      title: "Export started",
      description: `Exporting ${weekReports.length} report(s) from the last week...`,
    });
  }

  function handleExportMonth() {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthReports = reports.filter(
      (r) => new Date(r.date) >= monthAgo && new Date(r.date) <= today,
    );
    toast({
      title: "Export started",
      description: `Exporting ${monthReports.length} report(s) from the last month...`,
    });
  }

  return (
    <MainLayout>
      <div>
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <button
            onClick={handleGenerateReport}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Generate New Report
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Date Filters */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="startdate"
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="enddate"
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="mb-8 rounded-lg border bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/60 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Report Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {report.patientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(report.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {report.reportType}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDownload(report.id)}
                          className="text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleExportWeek}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export Last Week
          </button>
          <button
            onClick={handleExportMonth}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Export Last Month
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
