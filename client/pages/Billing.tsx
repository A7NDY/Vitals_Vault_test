import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function Billing() {
  return (
    <MainLayout>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="mt-4 text-slate-600">This page will contain billing and invoices.</p>
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-slate-700">No billing data yet. Integrate payments and invoices here.</p>
          <div className="mt-4">
            <Link to="/" className="inline-block rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:bg-slate-200">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
