import MainLayout from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import TrendCard from "@/components/dashboard/TrendCard";
import NotificationsList from "@/components/dashboard/NotificationsList";
import { useEffect, useState } from "react";
import DoctorRequestManager from "@/lib/doctor-requests";

export default function Index() {
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Count total doctors from registered users
    try {
      const users = JSON.parse(
        localStorage.getItem("vv_registered_users") || "[]",
      );
      const doctors = users.filter((u: any) => u.role === "Doctor").length;
      const patients = users.filter((u: any) => u.role === "Patient").length;
      setDoctorCount(doctors);
      setPatientCount(patients);
    } catch (e) {
      setDoctorCount(0);
      setPatientCount(0);
    }

    // Count pending doctor requests
    const allRequests = DoctorRequestManager.getAllRequests();
    const pending = allRequests.filter((r) => r.status === "pending").length;
    setPendingRequests(pending);
  }, []);

  // Count active alerts
  const [alertCount, setAlertCount] = useState(0);
  useEffect(() => {
    try {
      const alerts = JSON.parse(
        localStorage.getItem("vv_doctor_alerts") || "[]",
      );
      setAlertCount(alerts.length);
    } catch (e) {
      setAlertCount(0);
    }
  }, []);

  return (
    <MainLayout>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">
        Dashboard
      </h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Doctors" value={doctorCount} />
        <StatCard title="Total Patients" value={patientCount} />
        <StatCard title="Pending Doctor Approvals" value={pendingRequests} />
        <StatCard title="Active Alerts" value={alertCount} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTable />
        </div>
        <div className="lg:col-span-1">
          <NotificationsList />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Growth Trends
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TrendCard
            title="Patient Growth (Monthly)"
            change="+15%"
            data={[12, 9, 13, 10, 14, 18]}
            color="#0ea5e9"
          />
          <TrendCard
            title="Doctor Growth (Monthly)"
            change="+5%"
            data={[8, 12, 9, 11, 7, 10]}
            color="#60a5fa"
          />
        </div>
      </section>
    </MainLayout>
  );
}
