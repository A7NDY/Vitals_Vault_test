import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

const hero = "https://cdn.builder.io/api/v1/image/assets%2Fff7b5ae39b16499bb6e615caac5bc024%2Fae721b986124463ca5d9fb22cf23c41c?format=webp&width=1200";

interface RegisteredUser {
  email: string;
  password: string;
  fullName: string;
  role: "Doctor" | "Patient" | "Admin";
  phone: string;
}

function loadRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem("vv_registered_users");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  try {
    localStorage.setItem("vv_registered_users", JSON.stringify(users));
  } catch (e) {
    // ignore
  }
}

export default function Register() {
  const [role, setRole] = useState<"Doctor" | "Patient" | "Admin">("Patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  function handleRegister() {
    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    // Check if email already exists
    const existingUsers = loadRegisteredUsers();
    if (existingUsers.some((u) => u.email === email)) {
      toast({
        title: "Email already registered",
        description: "This email is already registered. Please log in instead.",
      });
      return;
    }

    // Save new user
    const newUser: RegisteredUser = {
      email,
      password,
      fullName,
      role,
      phone,
    };

    const updatedUsers = [...existingUsers, newUser];
    saveRegisteredUsers(updatedUsers);

    toast({
      title: "Account created",
      description: `Welcome ${fullName}! Your account has been created. Please log in.`,
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }

  return (
    <MainLayout hideHeader>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Create Your Account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join Vitals Vault and start managing your health.
        </p>

        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
          {/* Role Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Select your role
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRole("Doctor")}
                className={`rounded-tl-md rounded-bl-md px-4 py-2 text-sm ${
                  role === "Doctor"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => setRole("Patient")}
                className={`px-4 py-2 text-sm ${
                  role === "Patient"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Patient
              </button>
              <button
                onClick={() => setRole("Admin")}
                className={`rounded-tr-md rounded-br-md px-4 py-2 text-sm ${
                  role === "Admin"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-6 h-40 w-full overflow-hidden rounded-md bg-slate-50">
            <img src={hero} alt="hero" className="h-full w-full object-cover" />
          </div>

          {/* Form Fields */}
          <div className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="mt-6">
            <button
              onClick={handleRegister}
              className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
            >
              Create Account
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-sky-600 hover:underline font-medium"
              >
                Log In
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
