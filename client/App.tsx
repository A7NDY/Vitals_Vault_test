import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import MyPatients from "./pages/MyPatients";
import Algen from "./pages/Algen";
import Billing from "./pages/Billing";
import Vitals from "./pages/Vitals";
import Medications from "./pages/Medications";
import Reports from "./pages/Reports";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/AuthRoute";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Make login the main page */}
            <Route path="/" element={<Login />} />

            {/* Admin dashboard only */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["Admin"]}><Index /></ProtectedRoute>} />

            {/* Doctors area (Doctor + Admin) */}
            <Route path="/doctors" element={<ProtectedRoute allowedRoles={["Doctor"]}><Doctors /></ProtectedRoute>} />
            <Route path="/my-patients" element={<ProtectedRoute allowedRoles={["Doctor"]}><MyPatients /></ProtectedRoute>} />

            {/* Patients area (Patient + Admin) */}
            <Route path="/patients" element={<ProtectedRoute allowedRoles={["Patient"]}><Patients /></ProtectedRoute>} />
            <Route path="/vitals" element={<ProtectedRoute allowedRoles={["Patient"]}><Vitals /></ProtectedRoute>} />
            <Route path="/medications" element={<ProtectedRoute allowedRoles={["Patient"]}><Medications /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={["Patient", "Doctor"]}><Reports /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute allowedRoles={["Patient", "Doctor"]}><Appointments /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute allowedRoles={["Patient", "Doctor"]}><Messages /></ProtectedRoute>} />

            {/* Billing - admin only */}
            <Route path="/billing" element={<ProtectedRoute allowedRoles={["Admin"]}><Billing /></ProtectedRoute>} />

            <Route path="/algen" element={<ProtectedRoute allowedRoles={["Admin"]}><Algen /></ProtectedRoute>} />

            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
