import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";

const plans = [
  { name: "Basic", price: "199", note: "Up to 20 patients" },
  { name: "Standard", price: "499", note: "Up to 50 patients" },
  { name: "Premium", price: "999", note: "Unlimited patients" },
];

export default function Billing() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Load real subscriptions from localStorage (if any)
    try {
      const subs = JSON.parse(localStorage.getItem("vv_subscriptions") || "[]");
      setSubscriptions(subs);
    } catch (e) {
      setSubscriptions([]);
    }

    // Load real payments from localStorage (if any)
    try {
      const pays = JSON.parse(localStorage.getItem("vv_payments") || "[]");
      setPayments(pays);
    } catch (e) {
      setPayments([]);
    }
  }, []);

  return (
    <MainLayout>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">
        Subscription Plans & Payments
      </h1>

      <section className="mb-8">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Current Plans
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="text-sm text-slate-600">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900">
                  {p.price}
                </div>
                <div className="text-sm text-slate-500">/month</div>
              </div>
              <div className="mt-4">
                <button className="w-full rounded-md border bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800">
                  Select Plan
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-600">✓ {p.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Active Subscriptions
        </div>
        <div className="rounded-xl border bg-white shadow-sm">
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No active subscriptions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Doctor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Renewal Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {subscriptions.map((s) => (
                    <tr key={s.doctor}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {s.doctor}
                      </td>
                      <td className="px-6 py-4 text-sm text-sky-600">{s.plan}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {s.renewal}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-sky-600 hover:text-sky-700">
                            Upgrade/Downgrade
                          </button>
                          <span className="text-slate-300">|</span>
                          <button className="text-slate-600 hover:text-slate-700">
                            Send Reminder
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 text-sm font-medium text-slate-700">
          Payment History
        </div>
        <div className="rounded-xl border bg-white shadow-sm">
          {payments.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No payment records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {payments.map((t) => (
                    <tr key={t.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-sky-600">
                        {t.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {t.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {t.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {t.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
