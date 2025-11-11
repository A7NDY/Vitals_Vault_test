import { ReactNode } from "react";
import Header from "./Header";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container py-8">{children}</main>
    </div>
  );
}
