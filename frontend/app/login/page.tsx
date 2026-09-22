"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Code2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
  Users,
  ShieldCheck,
  Terminal,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Authenticating...");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

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

      toast.success("Welcome back! Redirecting...", { id: loadingToast });

      setTimeout(() => {
        router.push("/home");
      }, 800);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Cannot connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Showcase & Interactive Preview (Visible on large screens) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            {/* Top Brand Tag */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-md text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors w-fit group"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Next-Gen Multiplayer Coding Platform</span>
            </Link>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Code, collaborate, and build{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  in real-time.
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Connect seamlessly with your team. Experience ultra-fast synchronized editing, integrated live terminal output, and visual whiteboarding.
              </p>
            </div>

            {/* Code Snippet Card Mockup */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 font-mono text-xs backdrop-blur-md relative overflow-hidden group">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400 text-[11px] font-sans flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    session.collab.ts
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-purple-400">import</span> &#123;{" "}
                  <span className="text-indigo-300">CodeCollabRoom</span> &#125;{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">&quot;@codecollab/core&quot;</span>;
                </div>
                <div className="text-slate-500">// Initialize instant collaborative workspace</div>
                <div>
                  <span className="text-blue-400">const</span>{" "}
                  <span className="text-amber-300">room</span> ={" "}
                  <span className="text-purple-400">await</span> CodeCollabRoom.
                  <span className="text-blue-300">connect</span>(&#123;
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">roomId:</span>{" "}
                  <span className="text-emerald-300">&quot;production-team&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">multiCursor:</span>{" "}
                  <span className="text-amber-400">true</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">whiteboard:</span>{" "}
                  <span className="text-amber-400">true</span>
                </div>
                <div>&#125;);</div>
              </div>

              {/* Simulated active collaborators pill */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 bg-indigo-500 text-[10px] text-white flex items-center justify-center font-bold">
                      A
                    </span>
                    <span className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">
                      M
                    </span>
                    <span className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 bg-purple-500 text-[10px] text-white flex items-center justify-center font-bold">
                      S
                    </span>
                  </div>
                  <span>3 developers active</span>
                </div>
                <span className="text-indigo-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  0.4ms latency
                </span>
              </div>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <Zap className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Zero Lag</span>
              <span className="text-[10px] text-slate-500">Instant STOMP sync</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <Users className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Multiplayer</span>
              <span className="text-[10px] text-slate-500">Live multi-cursor</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <ShieldCheck className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Secure</span>
              <span className="text-[10px] text-slate-500">JWT Authentication</span>
            </div>
          </div>
        </div>

        {/* Right Side: High-End Auth Glass Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl p-7 sm:p-9 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80">
            {/* Header / Brand */}
            <div className="text-center space-y-2 mb-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2.5 mb-2 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Code<span className="text-indigo-400">Collab</span>
                </span>
              </Link>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Sign in to your account to continue coding
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-1 accent-indigo-500"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 active:scale-[0.99] shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 border border-indigo-400/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium tracking-wider">
                  New to CodeCollab?
                </span>
              </div>
            </div>

            {/* Footer Registration Callout */}
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust Notice */}
          <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted with TLS 1.3 & JWT authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}