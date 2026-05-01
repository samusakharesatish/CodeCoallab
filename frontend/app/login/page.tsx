"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter email & password");
      return;
    }

    try {
      setLoading(true);

      const loadingToast = toast.loading("Logging in...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      let data;
      try {
        data = await res.text();
      } catch {
        data = "Login failed";
      }

      if (!res.ok) {
        toast.error(data, { id: loadingToast });
        return;
      }

      localStorage.setItem("token", data);

      toast.success("Login successful 🎉", { id: loadingToast });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Login to continue your journey
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {/* Password Field with Eye Icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // 👈 toggle
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 rounded-lg border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {/* Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 
          ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Register */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register
          </a>
        </p>

      </div>
    </div>
  );
}