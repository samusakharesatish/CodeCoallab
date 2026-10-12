"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkAuth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");
    setIsLoggedIn(false);
    router.push("/");
  };

  const handleGoToApp = () => {
    const token = localStorage.getItem("token");
    router.push(token ? "/home" : "/login");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/25 relative overflow-x-hidden">
      {/* Subtle Ambient Radial Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-32 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[60%] -right-32 w-[420px] h-[420px] bg-emerald-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP NAVIGATION */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/60 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                <span className="font-mono text-sm font-bold text-white">&lt;/&gt;</span>
              </div>
              <span className="font-semibold tracking-tight text-white text-base">CodeCollab</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleGoToApp}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
                  >
                    Dashboard →
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-500/20 border border-indigo-400/20"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="px-6 pt-20 pb-16 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Version Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300 mb-8 backdrop-blur-md">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">JWT SECURE</span>
            <span>Architected for seamless real-time pairing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            Code, sketch, and execute. <br />
            <span className="bg-gradient-to-r from-zinc-200 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              In perfect synchronization.
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-normal">
            A minimalist multiplayer IDE paired with an infinite architecture whiteboard,
            live STOMP synchronization, and protected room spaces.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleGoToApp}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-xl shadow-white/5 flex items-center justify-center gap-2"
            >
              <span>Launch Workspace</span>
              <span className="text-zinc-400 font-mono text-xs">→</span>
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 transition backdrop-blur-md"
            >
              Join Existing Room
            </button>
          </div>
        </section>

        {/* BENTO GRID SHOWCASE */}
        <section className="max-w-6xl mx-auto px-6 py-12 w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-400 font-mono">Engineered for Focus</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
                Everything your team needs, organized in harmony.
              </h2>
            </div>
            <span className="hidden sm:block text-xs text-zinc-500 font-mono">v2.0 • Zero Friction</span>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: Monaco Code Editor (2 col, 2 row) */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-2xl bg-zinc-900/40 border border-white/[0.08] p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.16] transition-all">
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">01 / Realtime IDE</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Monaco Collaborative Editor</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Zero-latency typing sync with language-aware syntax highlighting across JavaScript, Python, and Java.
                </p>
              </div>

              {/* Code Mockup */}
              <div className="rounded-xl bg-zinc-950/80 border border-white/[0.06] p-4 font-mono text-xs text-zinc-300 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">●</span>
                    <span>solution.js</span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">Synced • 12ms</span>
                </div>
                <div className="space-y-1 text-zinc-400">
                  <p><span className="text-purple-400">async function</span> <span className="text-indigo-300">collaborate</span>() &#123;</p>
                  <p className="pl-4 text-zinc-500">// Real-time changes broadcast instantly</p>
                  <p className="pl-4"><span className="text-purple-400">const</span> session = <span className="text-purple-400">await</span> socket.<span className="text-blue-300">connect</span>(roomId);</p>
                  <p className="pl-4 text-zinc-300">session.<span className="text-blue-300">broadcast</span>(&#123; cursor: <span className="text-emerald-300">"active"</span> &#125;);</p>
                  <p>&#125;</p>
                </div>
              </div>
            </div>

            {/* CARD 2: Whiteboard Architecture (2 col, 1 row) */}
            <div className="md:col-span-1 lg:col-span-2 rounded-2xl bg-zinc-900/40 border border-white/[0.08] p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.16] transition-all">
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">02 / Whiteboard</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span className="px-1.5 py-0.5 bg-white/[0.05] rounded">Pen</span>
                    <span className="px-1.5 py-0.5 bg-white/[0.05] rounded">Rect</span>
                    <span className="px-1.5 py-0.5 bg-white/[0.05] rounded">Circle</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Infinite Vector Canvas</h3>
                <p className="text-zinc-400 text-sm">
                  Switch from code to whiteboard in one click. Plan workflows and system architecture together in real-time.
                </p>
              </div>

              {/* Whiteboard Preview Strip */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Room-scoped canvas topics</span>
                <span className="text-purple-300">Vector synced</span>
              </div>
            </div>

            {/* CARD 3: Instant Cloud Execution (1 col, 1 row) */}
            <div className="rounded-2xl bg-zinc-900/40 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.16] transition-all">
              <div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">03 / Compiler</span>
                <h4 className="text-base font-semibold text-white mt-3 mb-1">Instant Execution</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Sandbox execution via Judge0 with stdout, stderr, and execution benchmarks.
                </p>
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-zinc-950/80 border border-white/[0.05] font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                <span>stdout: 0 exit code</span>
                <span className="text-zinc-500">142ms</span>
              </div>
            </div>

            {/* CARD 4: Host Approval & JWT Security (1 col, 1 row) */}
            <div className="rounded-2xl bg-zinc-900/40 border border-white/[0.08] p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.16] transition-all">
              <div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">04 / Privacy</span>
                <h4 className="text-base font-semibold text-white mt-3 mb-1">Host-Guarded Rooms</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Zero-trust rooms with host join requests, HMAC-SHA256 signing, and stateless tokens.
                </p>
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-zinc-950/80 border border-white/[0.05] font-mono text-[11px] text-amber-300 flex items-center justify-between">
                <span>JWT: Validated</span>
                <span className="text-emerald-400">256-bit</span>
              </div>
            </div>

          </div>
        </section>

        {/* STATS STRIP */}
        <section className="border-y border-white/[0.06] bg-zinc-950/40 backdrop-blur-lg py-8 px-6 my-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono">0ms</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Cross-Room Leakage</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-400 font-mono">3</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Runtimes Supported</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">STOMP</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Socket Protocol</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-400 font-mono">100%</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Stateless Security</p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border border-white/[0.08] backdrop-blur-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Step into frictionless pair programming.
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8 font-normal">
              No complex installations. Simply create a room, share the encrypted link, and build together.
            </p>
            <button
              onClick={handleGoToApp}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-xl"
            >
              Start Coding Now →
            </button>
          </div>
        </section>

        {/* MINIMAL FOOTER */}
        <footer className="mt-auto border-t border-white/[0.06] py-8 px-6 text-center text-xs text-zinc-500 font-mono">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="font-semibold text-white">CodeCollab</span>
              <span>— Modern Collaborative IDE</span>
            </div>
            <div>
              <span>Crafted for developers • Secure & Realtime</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}