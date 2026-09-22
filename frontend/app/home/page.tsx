"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Code2,
  Plus,
  ArrowRight,
  Sparkles,
  Dices,
  RotateCcw,
  LogOut,
  User,
  Shield,
  Zap,
  Terminal,
  Layers,
  Loader2
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to continue");
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub);
      setIsLoggedIn(true);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const syncRoom = () => {
      const saved = localStorage.getItem("lastRoom");
      if (saved) setLastRoom(saved);
    };

    syncRoom();
    window.addEventListener("focus", syncRoom);
    return () => window.removeEventListener("focus", syncRoom);
  }, []);

  const goToRoom = (room: string) => {
    localStorage.setItem("lastRoom", room);
    setLastRoom(room);
    router.push(`/room/${room}`);
  };

  const isValidRoomId = (id: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");
    toast.success("Signed out successfully");
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const generateRoomId = () => {
    const id = "room-" + Math.random().toString(36).substring(2, 8);
    setRoomId(id);
    toast.success("Room ID generated");
  };

  const createRoom = async () => {
    let cleanRoom = roomId.trim();

    if (!cleanRoom) {
      cleanRoom = "room-" + Math.random().toString(36).substring(2, 8);
      setRoomId(cleanRoom);
    }

    if (!isValidRoomId(cleanRoom)) {
      toast.error("Invalid Room ID. Use letters, numbers, and dashes only.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token!.split(".")[1]));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: cleanRoom,
          hostId: payload.sub,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(typeof data === "string" ? data : "Failed to create room");
        return;
      }

      toast.success("Room created successfully!");
      goToRoom(data.roomId);
    } catch {
      toast.error("Cannot connect to server. Please check backend status.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    const cleanRoom = roomId.trim();

    if (!cleanRoom) {
      toast.error("Please enter a Room ID to join");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/room/exists/${cleanRoom}`);

      const data = await res.json();

      if (data === false) {
        toast.error("Room does not exist. Please check the ID.");
        return;
      }

      toast.success("Joining workspace...");
      goToRoom(cleanRoom);
    } catch {
      toast.error("Cannot connect to server. Please check backend status.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500/30 font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─── APP HEADER ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Code<span className="text-indigo-400">Collab</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-200">{userEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-red-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl p-7 sm:p-10 backdrop-blur-xl transition-all">
            {/* Header */}
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                WORKSPACE DASHBOARD
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Join or Create a Room
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
                Collaborate in real-time with Monaco code editor, cloud execution & whiteboard.
              </p>
            </div>

            {/* Room ID Input Box */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Room Identifier
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. team-standup or room-xyz"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-mono outline-none transition-all focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={generateRoomId}
                    title="Generate Random Room ID"
                    aria-label="Generate Random Room ID"
                    className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition cursor-pointer flex items-center justify-center group"
                  >
                    <Dices className="w-4 h-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={joinRoom}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl font-medium text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <>
                      <span>Join Room</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </>
                  )}
                </button>

                <button
                  onClick={createRoom}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Room</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rejoin Last Room */}
              {lastRoom && (
                <div className="pt-2">
                  <button
                    onClick={() => goToRoom(lastRoom)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-90 transition-transform duration-300" />
                    <span>Rejoin Recent Session: <b className="font-mono text-indigo-200">{lastRoom}</b></span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick feature indicators */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Low Latency</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Cursor</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Private Sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-[#050810]/50 backdrop-blur-md">
        CodeCollab Studio • Real-time Multiplayer Engineering Environment
      </footer>
    </div>
  );
}