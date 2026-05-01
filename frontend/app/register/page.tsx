"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const loadingToast = toast.loading("Registering...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      let data;
      try {
        data = await res.text();
      } catch {
        data = "Registration failed";
      }

      if (!res.ok) {
        toast.error(data, { id: loadingToast });
        return;
      }

      toast.success("Registered successfully 🎉", { id: loadingToast });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {
      console.error("REGISTER ERROR:", error);
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
            Create Account 🚀
          </h1>
          <p className="text-gray-500 text-sm">
            Join us and get started
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 rounded-lg border border-gray-300 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300
          ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>

      </div>
    </div>
  );
}