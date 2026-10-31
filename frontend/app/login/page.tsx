"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, KeyRound, ArrowRight, RotateCcw } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");

  // Password Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Sync email between tabs
  const handleTabChange = (tab: "password" | "otp") => {
    setActiveTab(tab);
    if (tab === "otp" && email && !otpEmail) {
      setOtpEmail(email);
    } else if (tab === "password" && otpEmail && !email) {
      setEmail(otpEmail);
    }
  };

  const handleAuthSuccess = (data: any, toastId?: string) => {
    const accessToken = typeof data === "object" ? (data.accessToken || data.token) : data;
    const refreshToken = typeof data === "object" ? data.refreshToken : null;

    localStorage.setItem("token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    toast.success("Welcome back!", toastId ? { id: toastId } : undefined);

    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get("redirect") || "/home";

    setTimeout(() => {
      router.push(redirectUrl);
    }, 500);
  };

  // ==========================================
  // 🔑 PASSWORD LOGIN
  // ==========================================
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Authenticating...");

      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!res.ok) {
        const errorMsg = typeof data === "string" ? data : (data?.error || data?.message || "Invalid credentials");
        toast.error(errorMsg, { id: loadingToast });
        return;
      }

      handleAuthSuccess(data, loadingToast);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Cannot connect to server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✉️ SEND OTP
  // ==========================================
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!otpEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Sending verification code...");

      const res = await apiFetch("/auth/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send code", { id: loadingToast });
        return;
      }

      toast.success("Code sent! Check inbox or terminal logs.", { id: loadingToast });
      setOtpStep("verify");
      setCountdown(60);
    } catch {
      toast.error("Cannot connect to server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ VERIFY OTP
  // ==========================================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Verifying code...");

      const res = await apiFetch("/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail.trim().toLowerCase(),
          otp: cleanCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed", { id: loadingToast });
        return;
      }

      handleAuthSuccess(data, loadingToast);
    } catch {
      toast.error("Cannot connect to server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-indigo-500/25">
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
          <p className="text-zinc-400 text-xs mt-1">Access your collaborative rooms and code sessions</p>
        </div>

        {/* Bento Card Form */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.08] p-7 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          {/* Segmented Tab Control */}
          <div className="flex p-1 rounded-xl bg-zinc-950/80 border border-white/[0.06] mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("password")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                activeTab === "password"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("otp")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                activeTab === "otp"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Code</span>
            </button>
          </div>

          {/* TAB 1: PASSWORD LOGIN */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                    className="w-full px-3.5 py-2.5 pr-12 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-mono"
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-zinc-700" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: EMAIL OTP LOGIN */}
          {activeTab === "otp" && (
            <div>
              {otpStep === "send" ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="developer@codecollab.dev"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Sign in securely with a 6-digit verification code sent to your email..
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Login Code</span>
                        <ArrowRight className="w-4 h-4 text-zinc-700" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-zinc-300">Verification Code</label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("send");
                          setOtpCode("");
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Change email
                      </button>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-indigo-500/40 text-center text-xl font-mono tracking-[0.5em] text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                    />

                    <p className="text-[11px] text-zinc-400 text-center mt-2">
                      Code sent to <span className="text-zinc-200 font-medium">{otpEmail}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full mt-2 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4 text-zinc-700" />
                      </>
                    )}
                  </button>

                  {/* Resend Action */}
                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <span className="text-xs text-zinc-500">
                        Resend code in <span className="font-mono text-zinc-400">{countdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Navigation */}
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
