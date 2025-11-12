import { ReactElement } from "react";
import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactElement;
  allowedRoles: string[];
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />; // send to login
  }

  // Admin can access everything
  if (user.role === "Admin") return children;

  if (allowedRoles.includes(user.role)) return children;

  // If role not allowed, redirect to role-specific dashboard
  if (user.role === "Doctor") return <Navigate to="/doctors" replace />;
  if (user.role === "Patient") return <Navigate to="/patients" replace />;

  return <Navigate to="/" replace />;
}
