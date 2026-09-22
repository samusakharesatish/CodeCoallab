"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Code2,
  User,
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

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (cleanPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating your account...");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      let data;
      try {
        data = await res.text();
      } catch {
        data = "Registration failed";
      }

      if (!res.ok) {
        toast.error(data || "Registration failed", { id: loadingToast });
        return;
      }

      toast.success("Account created successfully! Redirecting to login...", {
        id: loadingToast,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      toast.error("Cannot connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "bg-slate-700" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Features & Join Community */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            {/* Top Tag */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-md text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors w-fit group"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>Free Developer Account</span>
            </Link>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Join the modern standard for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
                  collaborative coding.
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Start sharing code rooms in seconds. Work with teammates, interview candidates, and sketch architectures on an interactive canvas.
              </p>
            </div>

            {/* Code Snippet Card Mockup */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 font-mono text-xs backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400 text-[11px] font-sans flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    developer-setup.ts
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-sans flex items-center gap-1">
                  Ready in 5s
                </span>
              </div>

              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-blue-400">const</span>{" "}
                  <span className="text-amber-300">account</span> ={" "}
                  <span className="text-purple-400">new</span>{" "}
                  <span className="text-indigo-300">Developer</span>(&#123;
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">instantRooms:</span>{" "}
                  <span className="text-emerald-300">&quot;unlimited&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">cloudCompiler:</span>{" "}
                  <span className="text-amber-400">true</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">whiteboardCollaboration:</span>{" "}
                  <span className="text-amber-400">true</span>
                </div>
                <div>&#125;);</div>
              </div>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <Zap className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Instant Access</span>
              <span className="text-[10px] text-slate-500">No card required</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <Users className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Unlimited</span>
              <span className="text-[10px] text-slate-500">Host private rooms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col items-center text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-slate-200">Privacy</span>
              <span className="text-[10px] text-slate-500">Isolated sandboxes</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Glass Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl p-7 sm:p-9 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80">
            {/* Header / Brand */}
            <div className="text-center space-y-2 mb-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2.5 mb-2 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Code<span className="text-purple-400">Collab</span>
                </span>
              </Link>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Create an account
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Get started with collaborative coding in seconds
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="alex_dev"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {password && (
                    <span className="text-[11px] text-slate-400">
                      Strength: <span className="font-medium text-slate-200">{strength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-950"
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

                {/* Password strength bar */}
                {password && (
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 active:scale-[0.99] shadow-lg shadow-purple-600/25 hover:shadow-purple-600/35 border border-purple-400/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create free account</span>
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
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Footer Login Callout */}
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust Notice */}
          <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant setup • No credit card required</span>
          </div>
        </div>
      </div>
    </div>
  );
}