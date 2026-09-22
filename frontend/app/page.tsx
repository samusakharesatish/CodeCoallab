"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  Terminal,
  Zap,
  Users,
  Play,
  Share2,
  Lock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  PenTool,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Shield,
  Laptop,
  Flame,
  LogOut,
  UserCheck
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "whiteboard" | "chat">("editor");
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
  };

  const handleGoToApp = () => {
    const token = localStorage.getItem("token");
    router.push(token ? "/home" : "/login");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[70%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Code<span className="text-indigo-400">Collab</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo-preview" className="hover:text-white transition-colors">
              Live Preview
            </a>
            <a href="#whiteboard" className="hover:text-white transition-colors">
              Whiteboard
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Workflow
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleGoToApp}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Logout"
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            Next-Gen Real-Time Multiplayer IDE & Canvas
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-medium text-indigo-400">v2.0 Beta</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Build, code & brainstorm together in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            real-time sync.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The collaborative workspace engineered for developers. Write code with live multi-cursor sync, compile in the cloud, brainstorm on an infinite whiteboard, and chat with your team.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleGoToApp}
            className="px-6 sm:px-8 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Launch CodeCollab Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#demo-preview"
            className="px-6 sm:px-8 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-slate-400" />
            <span>Interactive Demo</span>
          </a>
        </div>

        {/* Hero Quick Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sub-millisecond STOMP Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Monaco Multi-Language Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Integrated Architectural Canvas</span>
          </div>
        </div>

        {/* ─── INTERACTIVE HERO WORKSPACE PREVIEW ─── */}
        <div id="demo-preview" className="mt-16 sm:mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Mock Window Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="ml-4 flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      activeTab === "editor"
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    main.ts
                  </button>
                  <button
                    onClick={() => setActiveTab("whiteboard")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      activeTab === "whiteboard"
                        ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <PenTool className="w-3 h-3" />
                    architecture.canvas
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                      activeTab === "chat"
                        ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Team Chat (3)
                  </button>
                </div>
              </div>

              {/* Live Room Status Indicator */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-indigo-500 text-[11px] text-white flex items-center justify-center font-bold">
                      A
                    </span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-emerald-500 text-[11px] text-white flex items-center justify-center font-bold">
                      S
                    </span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-purple-500 text-[11px] text-white flex items-center justify-center font-bold">
                      D
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Room: dev-alpha
                </span>
              </div>
            </div>

            {/* Mock Window Content */}
            <div className="p-6 text-left min-h-[340px] flex flex-col justify-between">
              {activeTab === "editor" && (
                <div className="grid md:grid-cols-12 gap-6">
                  {/* Code Editor Mockup */}
                  <div className="md:col-span-8 font-mono text-xs leading-relaxed space-y-1.5 text-slate-300">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">1</span>
                      <span>
                        <span className="text-purple-400">import</span> &#123;{" "}
                        <span className="text-indigo-300">WebSocketEngine</span>,{" "}
                        <span className="text-indigo-300">MonacoSync</span> &#125;{" "}
                        <span className="text-purple-400">from</span>{" "}
                        <span className="text-emerald-300">&quot;@codecollab/core&quot;</span>;
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">2</span>
                      <span className="text-slate-500">// Real-time collaborative runtime initialized</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">3</span>
                      <span>
                        <span className="text-blue-400">export async function</span>{" "}
                        <span className="text-amber-300">startSession</span>(roomId:{" "}
                        <span className="text-purple-300">string</span>) &#123;
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">4</span>
                      <span className="pl-4">
                        <span className="text-blue-400">const</span>{" "}
                        <span className="text-slate-200">channel</span> ={" "}
                        <span className="text-purple-400">await</span> WebSocketEngine.
                        <span className="text-blue-300">join</span>(roomId);
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">5</span>
                      <span className="pl-4 relative inline-block">
                        <span className="text-slate-200">channel.</span>
                        <span className="text-blue-300">broadcastChanges</span>();
                        {/* Alex cursor */}
                        <span className="inline-block relative ml-1">
                          <span className="h-4 w-0.5 bg-indigo-400 inline-block animate-pulse align-middle" />
                          <span className="absolute -top-6 left-0 bg-indigo-500 text-white text-[9px] font-sans px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            Alex (Host)
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">6</span>
                      <span className="pl-4">
                        <span className="text-purple-400">return</span> &#123; status:{" "}
                        <span className="text-emerald-300">&quot;synchronized&quot;</span> &#125;;
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="w-6 text-right select-none">7</span>
                      <span>&#125;</span>
                    </div>

                    {/* Terminal Output Drawer */}
                    <div className="mt-6 rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center justify-between text-slate-500 pb-2 mb-2 border-b border-slate-900">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Play className="w-3 h-3 text-emerald-400" />
                          Output Console (TypeScript Node v20)
                        </span>
                        <span className="text-emerald-400">● 0 errors</span>
                      </div>
                      <div className="text-emerald-400 font-sans">
                        [EXEC] Compilation completed in 42ms
                      </div>
                      <div className="text-slate-300 font-mono">
                        &#123; status: &quot;synchronized&quot;, activePeers: 3, latency: &quot;0.4ms&quot; &#125;
                      </div>
                    </div>
                  </div>

                  {/* Right Mini Live Feed */}
                  <div className="md:col-span-4 rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <span>Active Session Activity</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          Live
                        </span>
                      </div>
                      <div className="mt-3 space-y-2.5 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                          <span className="text-indigo-400 font-medium">Alex:</span> Updated WebSocket handler to support binary chunks.
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                          <span className="text-emerald-400 font-medium">Sophia:</span> Running test suite against mock server.
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                          <span className="text-purple-400 font-medium">System:</span> Code compiled cleanly with exit code 0.
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                      <span>Room ID: <b>room-8x29a</b></span>
                      <Share2 className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "whiteboard" && (
                <div className="relative h-72 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-6 flex flex-col items-center justify-center overflow-hidden">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Interactive Nodes Preview */}
                  <div className="relative z-10 flex flex-wrap items-center justify-center gap-8">
                    <div className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-500/40 shadow-lg shadow-indigo-500/10 text-center">
                      <div className="text-xs font-bold text-indigo-200">Client WebSocket</div>
                      <div className="text-[10px] text-slate-400 mt-1">STOMP Protocol</div>
                    </div>

                    <div className="text-indigo-400 font-mono text-xs flex items-center gap-1">
                      <span>─── sync ───▶</span>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-500/40 shadow-lg shadow-purple-500/10 text-center">
                      <div className="text-xs font-bold text-purple-200">Spring Broker</div>
                      <div className="text-[10px] text-slate-400 mt-1">Channel Interceptor</div>
                    </div>

                    <div className="text-purple-400 font-mono text-xs flex items-center gap-1">
                      <span>─── emit ───▶</span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 text-center">
                      <div className="text-xs font-bold text-emerald-200">Monaco & Canvas</div>
                      <div className="text-[10px] text-slate-400 mt-1">Peer Renders</div>
                    </div>
                  </div>

                  <div className="mt-8 text-xs text-slate-400 flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-purple-400" />
                    <span>Collaborative Canvas with stroke replay, sticky notes & shapes</span>
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="h-72 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-500 text-xs font-bold text-white flex items-center justify-center">
                        A
                      </span>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-md text-xs text-slate-200">
                        <div className="font-semibold text-indigo-400 text-[11px] mb-1">Alex</div>
                        Hey team! The authentication interceptor is connected. Let&apos;s run the live execution tests.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-xs font-bold text-white flex items-center justify-center">
                        S
                      </span>
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-md text-xs text-slate-200">
                        <div className="font-semibold text-emerald-400 text-[11px] mb-1">Sophia</div>
                        Awesome! I just verified the whiteboard layout. Everything updates with zero lag.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                    <input
                      type="text"
                      disabled
                      placeholder="Type a message to your team in real-time..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 outline-none"
                    />
                    <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-medium text-white">
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES (BENTO GRID) ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Zap className="w-3.5 h-3.5" />
            ENGINEERED FOR TEAMS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything you need for seamless pair programming
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Say goodbye to clunky screen shares. CodeCollab gives you an interactive shared workspace equipped with industrial-strength developer tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Monaco Code Editor</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full VS Code editing experience with syntax highlighting, autocomplete, multi-cursors, and support for over 40+ programming languages.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Zero-Latency STOMP Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Spring Boot WebSocket broker and STOMP sub-protocols. Changes sync instantly across all peers without merge conflicts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cloud Code Execution</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Execute Python, Java, JavaScript, and C++ code with one click. Get instant stdout logs and runtime metrics right in your browser.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Whiteboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sketch system architectures, draw database schemas, and explain algorithms with real-time vector strokes and shapes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Built-in Team Chat</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No need to switch between Slack or Discord. Chat with colleagues and review code snippets directly within your active session room.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Room Governance</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Granular host approvals, secure JWT tokens, private invite links, and automated cleanup of ephemeral sandboxes.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHITEBOARD SPOTLIGHT SECTION ─── */}
      <section id="whiteboard" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <PenTool className="w-3.5 h-3.5" />
              VISUAL BRAINSTORMING
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Design architectures and explain logic visually.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Some problems are better solved with a diagram than a hundred lines of code. CodeCollab includes a synchronous whiteboard so you can sketch workflows alongside your editor.
            </p>

            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Synchronized drawing with zero delay</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Diagram database schemas, REST APIs, and microservices</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Ideal for technical interviews and pair debugging sessions</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Instant snapshot exports for documentation</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleGoToApp}
                className="px-6 py-3 rounded-xl font-medium text-sm text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <span>Try the Whiteboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">System Architecture Canvas</span>
                </div>
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Real-time 60 FPS
                </span>
              </div>

              {/* Canvas visual representation */}
              <div className="h-72 rounded-2xl bg-slate-950 p-6 flex flex-col items-center justify-center border border-slate-800/80 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                  }}
                />

                {/* Simulated dynamic diagram */}
                <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
                  <div className="w-full p-3 rounded-xl bg-indigo-900/50 border border-indigo-500/40 text-center shadow-lg">
                    <div className="text-xs font-bold text-indigo-300">Frontend (Next.js 16 + React 19)</div>
                    <div className="text-[10px] text-slate-400">Monaco Editor • StompJS • HTML5 Canvas</div>
                  </div>

                  <div className="text-indigo-400 font-mono text-xs">▼ WebSocket Duplex ▼</div>

                  <div className="w-full p-3 rounded-xl bg-purple-900/50 border border-purple-500/40 text-center shadow-lg">
                    <div className="text-xs font-bold text-purple-300">Backend Cluster (Spring Boot 3)</div>
                    <div className="text-[10px] text-slate-400">JWT Interceptor • Message Broker • JPA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (3-STEP FLOW) ─── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 text-center">
        <div className="max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Layers className="w-3.5 h-3.5" />
            INSTANT COLLABORATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Collaborate in three simple steps
          </h2>
          <p className="text-slate-400 text-base">
            No software installation or complicated Docker setups. Start coding directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-4xl font-extrabold text-indigo-500/30 mb-4 font-mono">01</div>
            <h3 className="text-lg font-bold text-white mb-2">Create or Join a Room</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate a unique room ID with 1-click or enter an existing session shared by your teammate.
            </p>
          </div>

          <div className="relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-4xl font-extrabold text-purple-500/30 mb-4 font-mono">02</div>
            <h3 className="text-lg font-bold text-white mb-2">Share the Access Link</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Send the room link to your collaborators. Hosts have granular control to accept or manage permissions.
            </p>
          </div>

          <div className="relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-4xl font-extrabold text-blue-500/30 mb-4 font-mono">03</div>
            <h3 className="text-lg font-bold text-white mb-2">Code, Execute & Ship</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Type together in Monaco, brainstorm on the whiteboard, run your scripts, and chat in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA BANNER ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/50 via-indigo-900/60 to-purple-900/50 border border-indigo-500/30 p-10 sm:p-16 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to supercharge your team&apos;s code collaboration?
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg">
              Experience the power of synchronized coding, live compilation, and visual planning in one seamless studio.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleGoToApp}
                className="px-8 py-4 rounded-2xl font-bold text-base text-slate-950 bg-white hover:bg-slate-100 shadow-xl shadow-white/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Free Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Code<span className="text-indigo-400">Collab</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} CodeCollab. Built for modern software engineering teams.
          </p>
        </div>
      </footer>
    </div>
  );
}