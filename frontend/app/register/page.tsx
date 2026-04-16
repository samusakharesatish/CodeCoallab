"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`, // ✅ FIXED
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

      toast.success("Registered successfully", { id: loadingToast });

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
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">
          Register 📝
        </h1>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 outline-none"
        />

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
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}