"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../lib/api";
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
  Loader2,
  Copy,
  Check,
  Link2
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [copiedRecent, setCopiedRecent] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [navigatingRoom, setNavigatingRoom] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to continue");
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
      }
      setUserEmail(payload.sub);
      setUsername(payload.username || payload.sub.split("@")[0]);
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
    setNavigatingRoom(room);
    router.push(`/room/${room}`);
  };

  const copyRoomLink = async (room: string, source: "recent" | "input" = "input") => {
    const cleanRoom = room.trim();
    if (!cleanRoom) return;

    const inviteUrl = `${window.location.origin}/room/${cleanRoom}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      if (source === "recent") {
        setCopiedRecent(true);
        setTimeout(() => setCopiedRecent(false), 2000);
      } else {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      }

      toast.success("Room invite link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const isValidRoomId = (id: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("lastRoom");
    toast.success("Signed out safely");
    setTimeout(() => {
      window.location.href = "/";
    }, 400);
  };

  const generateMeetStyleId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const getRandom = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${getRandom(3)}-${getRandom(4)}-${getRandom(3)}`;
  };

  const generateRoomId = () => {
    const id = generateMeetStyleId();
    setRoomId(id);
    toast.success("Room ID generated");
  };

  const createRoom = async () => {
    let cleanRoom = roomId.trim();

    if (!cleanRoom) {
      cleanRoom = generateMeetStyleId();
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
      const res = await apiFetch("/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: cleanRoom,
          hostId: payload.sub,
          hostUsername: payload.username || payload.sub,
          language: "javascript",
        }),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(typeof data === "string" ? data : (data?.error || data?.message || "Failed to create room"));
        setLoading(false);
        return;
      }

      toast.success("Workspace initialized!");
      goToRoom(data.roomId);
    } catch {
      toast.error("Cannot connect to server. Check backend status.");
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
      const res = await apiFetch(`/room/exists/${cleanRoom}`);

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data === false) {
        toast.error("Room does not exist. Check the ID.");
        setLoading(false);
        return;
      }

      toast.success("Connecting to room...");
      goToRoom(cleanRoom);
    } catch {
      toast.error("Cannot connect to server. Check backend status.");
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
                      placeholder="e.g. dvk-mrbp-qtz"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toLowerCase())}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 font-mono transition"
                    />
                    {activeTab === "create" && (
                      <button
                        type="button"
                        onClick={generateRoomId}
                        title="Generate random room ID"
                        className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 transition font-mono text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <span>🎲</span>
                        <span className="hidden sm:inline text-xs">Random</span>
                      </button>
                    )}
                    {roomId.trim() && (
                      <button
                        type="button"
                        onClick={() => copyRoomLink(roomId, "input")}
                        title="Copy invite link"
                        className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition font-mono text-xs flex items-center gap-1.5 shrink-0"
                      >
                        {copiedInput ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline text-xs text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-xs">Copy Link</span>
                          </>
                        )}
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
                    disabled={loading || Boolean(navigatingRoom)}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>{navigatingRoom ? "Entering Workspace..." : "Initializing..."}</span>
                      </>
                    ) : (
                      "Create & Launch →"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={joinRoom}
                    disabled={loading || Boolean(navigatingRoom)}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{navigatingRoom ? "Entering Room..." : "Connecting..."}</span>
                      </>
                    ) : (
                      "Request to Join →"
                    )}
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
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm text-zinc-100 font-medium truncate">{lastRoom}</p>
                      <button
                        type="button"
                        onClick={() => copyRoomLink(lastRoom, "recent")}
                        title="Copy invite link"
                        className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white transition flex items-center justify-center shrink-0"
                      >
                        {copiedRecent ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950/40 border border-white/[0.04] text-center text-xs text-zinc-500">
                    No recent session found
                  </div>
                )}
              </div>

              {lastRoom && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => goToRoom(lastRoom)}
                    disabled={Boolean(navigatingRoom)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {navigatingRoom === lastRoom ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Entering...</span>
                      </>
                    ) : (
                      <>
                        <span>Re-enter Room</span>
                        <span className="font-mono text-[10px]">→</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyRoomLink(lastRoom, "recent")}
                    title="Copy invite link"
                    className="px-3 py-2.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedRecent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
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