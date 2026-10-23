"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Authenticating...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      let data;
      try {
        data = await res.text();
      } catch {
        data = "Login failed";
      }

      if (!res.ok) {
        toast.error(data || "Invalid credentials", { id: loadingToast });
        return;
      }

      // Save token
      localStorage.setItem("token", data);
      toast.success("Welcome back!", { id: loadingToast });

      setTimeout(() => {
        router.push("/home");
      }, 600);

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Cannot connect to server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 mb-4 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10 group-hover:scale-105 transition-transform">
              <span className="font-mono text-sm font-bold text-white">&lt;/&gt;</span>
            </div>
            <span className="font-semibold tracking-tight text-white text-lg">CodeCollab</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign in to your account</h1>
          <p className="text-zinc-400 text-xs mt-1">Enter your credentials to access your collaborative rooms</p>
        </div>

        {/* Bento Card Form */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.08] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
              <input
                type="email"
                required
                placeholder="developer@codecollab.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition text-xs font-mono"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="font-mono text-xs text-zinc-400">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            <span>Don't have an account? </span>
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition"
            >
              Create one
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Back to CodeCollab home
          </button>
        </div>
      </div>
    </div>
  );
}
