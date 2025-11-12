import { ReactNode } from "react";
import Header from "./Header";

export default function MainLayout({ children, hideHeader = false }: { children: ReactNode; hideHeader?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {!hideHeader && <Header />}
      <main className="container py-8">{children}</main>
    </div>
  );
}
