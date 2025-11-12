import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import * as Router from "react-router-dom";

export default function Header() {
  const location = Router.useLocation();
  const navigate = Router.useNavigate();
  const { user, logout } = useAuth();

  let nav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/patients", label: "Patients" },
    { to: "/doctors", label: "Doctors" },
    { to: "/algen", label: "Algen" },
    { to: "/billing", label: "Billing" },
  ];

  if (user && user.role === "Doctor") {
    nav = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/patients", label: "My Patients" },
      { to: "/appointments", label: "Appointments" },
      { to: "/reports", label: "Reports" },
      { to: "/messages", label: "Messages" },
    ];
  } else if (user && user.role === "Patient") {
    nav = [
      { to: "/patients", label: "Dashboard" },
      { to: "/vitals", label: "Vitals" },
      { to: "/medications", label: "Medications" },
      { to: "/reports", label: "Reports" },
      { to: "/appointments", label: "Appointments" },
      { to: "/messages", label: "Messages" },
    ];
  }

  function handleLogout() {
    try {
      logout();
    } catch (e) {
      // ignore
    }
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Router.Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-800">
            <div className="h-6 w-6 rounded-sm bg-slate-900" />
            <span>Vitals Vault</span>
          </Router.Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <Router.NavLink
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
              </Router.NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">2</span>
          </button>

          <img src="https://i.pravatar.cc/40?img=65" alt="User avatar" className="h-9 w-9 rounded-full border" />

          <button onClick={handleLogout} className="hidden md:inline-flex items-center gap-2 rounded-md border bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
