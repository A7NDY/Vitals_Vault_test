import { AlertTriangle } from "lucide-react";

type Item = { title: string; description: string };

const items: Item[] = [
  {
    title: "API Error",
    description: "API connection to external service failed.",
  },
  {
    title: "Integration Issue",
    description: "Integration with billing system is experiencing issues.",
  },
  {
    title: "Subscription Reminder",
    description: "Subscription for premium features will expire in 7 days.",
  },
];

export default function NotificationsList() {
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
