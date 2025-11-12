import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/patients", label: "Patients" },
  { to: "/doctors", label: "Doctors" },
  { to: "/algen", label: "Algen" },
  { to: "/billing", label: "Billing" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-slate-800"
          >
            <div className="h-6 w-6 rounded-sm bg-slate-900" />
            <span>Vitals Vault Admin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-slate-600 hover:text-slate-900",
                    isActive || (item.to === "/" && location.pathname === "/")
                      ? "bg-slate-100 text-slate-900"
                      : "hover:bg-slate-100",
                  )
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
              2
            </span>
          </button>
          <img
            src="https://i.pravatar.cc/40?img=65"
            alt="User avatar"
            className="h-9 w-9 rounded-full border"
          />
        </div>
      </div>
    </header>
  );
}
