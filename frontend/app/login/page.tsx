"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`, // ✅ FIXED
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

      toast.success("Login successful", { id: loadingToast });

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
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">
          Login 🔐
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 outline-none"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-400">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}