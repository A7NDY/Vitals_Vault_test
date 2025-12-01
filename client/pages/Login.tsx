import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";

const hero =
  "https://cdn.builder.io/api/v1/image/assets%2Fff7b5ae39b16499bb6e615caac5bc024%2Fae721b986124463ca5d9fb22cf23c41c?format=webp&width=1200";

interface RegisteredUser {
  email: string;
  password: string;
  fullName: string;
  role: "Doctor" | "Patient" | "Admin";
  phone: string;
}

function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem("vv_registered_users");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function Login() {
  const [role, setRole] = useState<"Doctor" | "Patient" | "Admin">("Patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleLogin() {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password.",
      });
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = getRegisteredUsers();

    // Find user with matching email and password
    const foundUser = registeredUsers.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.role === role,
    );

    if (!foundUser) {
      toast({
        title: "Login failed",
        description:
          "Invalid email, password, or role. Please check your credentials or sign up if you're new.",
      });
      return;
    }

    toast({
      title: "Signed in",
      description: `Welcome back, ${foundUser.fullName}!`,
    });

    // persist auth state via context
    login({ email, role });

    setTimeout(() => {
      if (role === "Doctor") navigate("/doctors");
      else if (role === "Patient") navigate("/patients");
      else navigate("/dashboard");
    }, 500);
  }

  return (
    <MainLayout hideHeader>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Welcome to Vitals Vault
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Please select your role to log in.
        </p>

        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRole("Doctor")}
              className={`rounded-tl-md rounded-bl-md px-4 py-2 text-sm ${role === "Doctor" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Doctor
            </button>
            <button
              onClick={() => setRole("Patient")}
              className={`px-4 py-2 text-sm ${role === "Patient" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("Admin")}
              className={`rounded-tr-md rounded-br-md px-4 py-2 text-sm ${role === "Admin" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Admin
            </button>
          </div>

          <div className="mt-4 h-40 w-full overflow-hidden rounded-md bg-slate-50">
            <img src={hero} alt="hero" className="h-full w-full object-cover" />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email or username"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <a className="text-sm text-slate-500 hover:underline">
              Forgot Password?
            </a>
            <div className="text-sm text-slate-500">
              Role: <strong className="text-slate-700">{role}</strong>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogin}
              className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Log In
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-sky-600 hover:underline font-medium bg-none border-none cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2024 Vitals Vault. All rights reserved.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
