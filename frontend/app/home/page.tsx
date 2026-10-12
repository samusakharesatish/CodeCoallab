"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub);
      setUsername(payload.username || payload.sub.split("@")[0]);
      setIsLoggedIn(true);
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

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
    window.location.href = `/room/${room}`;
  };

  const isValidRoomId = (id: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");
    toast.success("Signed out safely");
    setTimeout(() => {
      window.location.href = "/";
    }, 400);
  };

  const generateRoomId = () => {
    const id = "collab-" + Math.random().toString(36).substring(2, 8);
    setRoomId(id);
    toast.success("Room ID generated 🎲");
  };

  const createRoom = async () => {
    let cleanRoom = roomId.trim();

    if (!cleanRoom) {
      cleanRoom = "collab-" + Math.random().toString(36).substring(2, 8);
      setRoomId(cleanRoom);
    }

    if (!isValidRoomId(cleanRoom)) {
      toast.error("Invalid Room ID. Use letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token!.split(".")[1]));
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/room/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

      toast.success("Workspace initialized!");
      goToRoom(data.roomId);

    } catch {
      toast.error("Cannot connect to server. Check backend status.");
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
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/room/exists/${cleanRoom}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data === false) {
        toast.error("Room does not exist. Check the ID.");
        return;
      }

      toast.success("Connecting to room...");
      goToRoom(cleanRoom);

    } catch {
      toast.error("Cannot connect to server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/25">
      {/* Background Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[350px] bg-purple-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* GLASS TOPBAR */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/60 border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md border border-white/10 group-hover:scale-105 transition-transform">
                  <span className="font-mono text-sm font-bold text-white">&lt;/&gt;</span>
                </div>
                <span className="font-semibold tracking-tight text-white text-base">CodeCollab</span>
              </a>
              <span className="text-zinc-600 font-mono text-xs">/</span>
              <span className="text-xs font-mono text-zinc-400">Hub</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs flex items-center justify-center border border-indigo-400/30">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-zinc-300 font-medium hidden sm:inline">{username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD (BENTO GRID) */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Workspace Hub</h1>
            <p className="text-zinc-400 text-sm mt-1">Start a new pairing room or join your team's live session.</p>
          </div>

          {/* BENTO GRID CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* CARD 1: MAIN ACTION (2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-zinc-900/50 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Segmented Control */}
                <div className="inline-flex p-1 rounded-xl bg-zinc-950/70 border border-white/[0.06] mb-6">
                  <button
                    onClick={() => setActiveTab("create")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === "create"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Create Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab("join")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === "join"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Join with ID
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {activeTab === "create" ? "Initialize a new room" : "Enter room credentials"}
                  </h2>
                  <p className="text-zinc-400 text-xs">
                    {activeTab === "create"
                      ? "You will be assigned as the room host with join request authorization controls."
                      : "The room host will receive your request to approve access."}
                  </p>
                </div>

                {/* Input with Generator */}
                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-medium text-zinc-300">Room Identifier</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. system-design-01"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 font-mono transition"
                    />
                    {activeTab === "create" && (
                      <button
                        type="button"
                        onClick={generateRoomId}
                        title="Generate random room ID"
                        className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 transition font-mono text-xs flex items-center gap-1.5"
                      >
                        <span>🎲</span>
                        <span className="hidden sm:inline text-xs">Random</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {activeTab === "create" ? (
                  <button
                    onClick={createRoom}
                    disabled={loading}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Initializing..." : "Create & Launch →"}
                  </button>
                ) : (
                  <button
                    onClick={joinRoom}
                    disabled={loading}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Connecting..." : "Request to Join →"}
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: QUICK REJOIN (1 col) */}
            <div className="rounded-2xl bg-zinc-900/50 border border-white/[0.08] p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Recent Session
                </span>
                <h3 className="text-base font-semibold text-white mt-3 mb-1">Quick Reconnect</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Resume your last active room with current code state preserved.
                </p>

                {lastRoom ? (
                  <div className="mt-4 p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 font-mono">Room ID:</span>
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Cached
                      </span>
                    </div>
                    <p className="font-mono text-sm text-zinc-100 font-medium truncate">{lastRoom}</p>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950/40 border border-white/[0.04] text-center text-xs text-zinc-500">
                    No recent session found
                  </div>
                )}
              </div>

              {lastRoom && (
                <button
                  onClick={() => goToRoom(lastRoom)}
                  className="w-full mt-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 transition flex items-center justify-center gap-2"
                >
                  <span>Re-enter Room</span>
                  <span className="font-mono text-[10px]">→</span>
                </button>
              )}
            </div>

            {/* CARD 3: SECURITY PILL (1 col) */}
            <div className="rounded-2xl bg-zinc-900/40 border border-white/[0.06] p-5 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Host Protection
                </span>
                <h4 className="text-sm font-semibold text-white mt-3 mb-1">Zero-Trust Access</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Room hosts maintain approval over every joining collaborator. Unapproved requests cannot observe code or whiteboard.
                </p>
              </div>
              <div className="mt-4 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
                <span>Access: Guarded</span>
                <span className="text-emerald-400">JWT Validated</span>
              </div>
            </div>

            {/* CARD 4: WORKSPACE CAPABILITIES (2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-zinc-900/40 border border-white/[0.06] p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Unified Tools
                </span>
                <h4 className="text-sm font-semibold text-white mt-2 mb-1">Monaco Editor • Vector Canvas • Judge0</h4>
                <p className="text-zinc-400 text-xs">
                  Switch between coding and architecture sketching in real-time with isolated room communication.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-xs font-mono text-zinc-300">JS</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-xs font-mono text-zinc-300">PY</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-xs font-mono text-zinc-300">JAVA</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}