import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function Algen() {
  return (
    <MainLayout>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Algen</h1>
        <p className="mt-4 text-slate-600">Placeholder for Algen (AI/analytics) features.</p>
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-slate-700">Analytics and AI tools will appear here.</p>
          <div className="mt-4">
            <Link to="/" className="inline-block rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:bg-slate-200">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
