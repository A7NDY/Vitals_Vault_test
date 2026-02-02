import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

type Item = { title: string; description: string };

export default function NotificationsList() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const notifications: Item[] = [];

    // Check for critical vitals alerts
    try {
      const alerts = JSON.parse(
        localStorage.getItem("vv_doctor_alerts") || "[]",
      );
      if (alerts.length > 0) {
        notifications.push({
          title: "Critical Alerts",
          description: `${alerts.length} patient alert(s) require attention`,
        });
      }
    } catch (e) {
      // ignore
    }

    // Check for pending doctor requests
    try {
      const requests = JSON.parse(
        localStorage.getItem("vv_doctor_requests") || "[]",
      );
      const pending = requests.filter(
        (r: any) => r.status === "pending",
      ).length;
      if (pending > 0) {
        notifications.push({
          title: "Pending Doctor Requests",
          description: `${pending} doctor connection request(s) awaiting your decision`,
        });
      }
    } catch (e) {
      // ignore
    }

    // Check system health
    try {
      const users = JSON.parse(
        localStorage.getItem("vv_registered_users") || "[]",
      );
      if (users.length === 0) {
        notifications.push({
          title: "No Users Registered",
          description:
            "Start by having doctors and patients register in the system",
        });
      }
    } catch (e) {
      // ignore
    }

    if (notifications.length === 0) {
      notifications.push({
        title: "System Healthy",
        description: "All systems operating normally",
      });
    }

    setItems(notifications);
  }, []);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-medium text-slate-700">
        System Notifications
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border bg-slate-50 text-slate-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">
                {item.title}
              </div>
              <div className="text-sm text-slate-600">{item.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
