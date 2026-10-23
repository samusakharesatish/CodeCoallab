"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import ChatPanel from "./ChatPanel";
import EditorPanel from "./EditorPanel";
import WhiteboardCanvas from "./WhiteboardCanvas";
import { connectSocket, sendView } from "../../lib/socket";

/* ================= TYPES ================= */

type ChatMessage = {
  userId: string;
  message: string;
  timestamp: string;
};

type RoomView = "editor" | "whiteboard";

type ViewSyncPayload = {
  roomId: string;
  view: RoomView;
  ts: number;
};

type DrawEventPayload = { userId?: string };
type CodeEventPayload = { userId?: string; code?: string };
type TypingEventPayload = { userId: string; isTyping: boolean };
type LanguageEventPayload = { language?: string };
type RunEventPayload = { output?: string };

type RoomUser = {
  userId: string;
  username: string;
  joinedAt?: string;
};

type JoinRequest = {
  roomId: string;
  userId: string;
  username: string;
  status: string;
};

/* ================= COMPONENT ================= */

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId;
  const roomIdStr = typeof roomId === "string" ? roomId : "";

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
  const [view, setView] = useState<RoomView>("editor");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔥 NEW (approval system)
  const [isApproved, setIsApproved] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const isRemote = useRef(false);

  /* ================= SESSION ================= */
  useEffect(() => {
    let session = sessionStorage.getItem("sessionId");
    if (!session) {
      session = Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem("sessionId", session);
    }
    setSessionId(session);
  }, []);

  /* ================= SAVE ROOM ================= */
  useEffect(() => {
    if (roomIdStr) {
      localStorage.setItem("lastRoom", roomIdStr);
    }
  }, [roomIdStr]);

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.sub);
      setUsername(payload.username || payload.sub);
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  /* ================= CHECK HOST ================= */
  useEffect(() => {
    if (!roomIdStr || !userId) return;

    const checkHost = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/room/${roomIdStr}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (String(data.hostId) === String(userId)) {
          setIsHost(true);
          setIsApproved(true);
        } else {
          await fetch(`${apiUrl}/join/request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roomId: roomIdStr, userId, username }),
          });
        }
      } catch (err) {
        console.warn("Check host network error:", err);
      }
    };

    checkHost();
  }, [roomIdStr, userId, username]);

  /* ================= WAIT FOR APPROVAL ================= */
  useEffect(() => {
    if (!userId || isHost || isApproved) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(
          `${apiUrl}/join/status/${roomIdStr}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "APPROVED") {
          setIsApproved(true);
          toast.success("Host approved your join request!");
          clearInterval(interval);
        } else if (data.status === "REJECTED") {
          toast.error("Host rejected your join request.");
          clearInterval(interval);
        }
      } catch (err) {
        // Gracefully ignore temporary network hiccups while server boots
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [roomIdStr, userId, isHost, isApproved]);

  /* ================= HOST REQUEST LIST ================= */
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(
        `${apiUrl}/join/pending/${roomIdStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return;
      const data: JoinRequest[] = await res.json();
      setRequests(data);
    } catch (err) {
      // Gracefully ignore polling drops
    }
  };

  useEffect(() => {
    if (!isHost) return;
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, [isHost]);

  const approveUser = async (r: JoinRequest) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/join/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(r),
      });
      fetchRequests();
    } catch (err) {
      toast.error("Failed to approve user");
    }
  };

  const rejectUser = async (r: JoinRequest) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/join/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(r),
      });
      fetchRequests();
    } catch (err) {
      toast.error("Failed to reject user");
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!roomIdStr || !userId || !sessionId || !isApproved) return;

    connectSocket(roomIdStr, {
      userId,
      username,
      sessionId,

      onDraw: (data: DrawEventPayload) => {
        window.dispatchEvent(
          new CustomEvent("draw-event", { detail: data })
        );
      },

      onCode: (data: CodeEventPayload) => {
        if (data.userId === userId) return;

        isRemote.current = true;

        setCode((prev) => {
          if (data.code !== undefined && data.code !== prev) {
            return data.code;
          }
          return prev;
        });
      },

      onTyping: (data: TypingEventPayload) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (data.isTyping) updated.add(data.userId);
          else updated.delete(data.userId);
          return updated;
        });
      },

      onChat: (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);

        if (!isChatOpen && data.userId !== userId) {
          setUnreadCount((prev) => prev + 1);
        }
      },

      onLanguage: (data: LanguageEventPayload) => {
        if (data?.language) {
          setLanguage(data.language);
        }
      },

      onRun: (data: RunEventPayload) => {
        setOutput(data.output ?? "");
      },

      onUsers: (data: RoomUser[]) => {
        if (Array.isArray(data)) {
          setOnlineUsers(data);
        }
      },

      onView: (data: ViewSyncPayload) => {
        if (data.roomId !== roomIdStr) return;
        setView(data.view);
      },
    });
  }, [roomIdStr, sessionId, userId, username, isApproved]);

  /* ================= FETCH ROOM ================= */
  useEffect(() => {
    if (!roomIdStr) return;

    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room/${roomIdStr}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        let data: any;
        try {
          data = await res.json();
        } catch {
          data = "EMPTY";
        }

        if (data !== "EMPTY") {
          setCode(data.code || "");
          if (data.language) {
            setLanguage(data.language);
          }
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("ROOM FETCH ERROR:", err);
      }
    };

    fetchRoom();
  }, [roomIdStr]);

  if (!roomIdStr || !userId) return null;

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative z-10 max-w-sm w-full p-8 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-2xl text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center text-xl animate-pulse">
            ⏳
          </div>
          <h2 className="text-lg font-semibold text-white">Pending Host Approval</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your request to enter room <span className="font-mono text-indigo-300 font-medium">{roomIdStr}</span> was sent to the host. You'll enter automatically once approved.
          </p>
          <div className="pt-2">
            <button
              onClick={() => (window.location.href = "/home")}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition"
            >
              ← Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden select-none">
      {/* GLASS TOP NAVIGATION */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl z-30 shrink-0">
        {/* LEFT: BRAND & ROOM INFO */}
        <div className="flex items-center gap-3">
          <a
            href="/home"
            className="flex items-center gap-2 group"
            title="Return to Hub"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md border border-white/10 group-hover:scale-105 transition-transform">
              <span className="font-mono text-sm font-bold text-white">&lt;/&gt;</span>
            </div>
          </a>

          <div className="h-4 w-px bg-white/[0.1]" />

          {/* Room Pill */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("🔗 Room invite link copied!");
            }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] transition text-xs font-mono text-zinc-300"
            title="Click to copy link"
          >
            <span className="text-zinc-500">Room:</span>
            <span className="text-white font-medium">{roomIdStr}</span>
            <span className="text-[10px] text-zinc-500 hover:text-zinc-300">📋</span>
          </button>

          {/* Active Participants */}
          <div
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono cursor-pointer"
            title={onlineUsers.map((u) => u.username || u.userId).join(", ")}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{onlineUsers.length > 0 ? onlineUsers.length : 1} active</span>

            {/* Hover Tooltip with online user list */}
            {onlineUsers.length > 0 && (
              <div className="absolute top-8 left-0 hidden group-hover:flex flex-col gap-1 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-[11px] min-w-[140px] pointer-events-none backdrop-blur-xl">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold border-b border-white/[0.06] pb-1">
                  Online Users
                </span>
                {onlineUsers.map((u, i) => (
                  <div key={u.userId || i} className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{u.username || u.userId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: VIEW TOGGLE (SEGMENTED PILL) */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900/80 border border-white/[0.08] backdrop-blur-md">
          <button
            onClick={() => {
              if (view !== "editor") {
                const newView: RoomView = "editor";
                setView(newView);
                sendView(roomIdStr, { roomId: roomIdStr, view: newView, ts: Date.now() });
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-medium transition ${
              view === "editor"
                ? "bg-white text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>💻</span>
            <span>Code Editor</span>
          </button>

          <button
            onClick={() => {
              if (view !== "whiteboard") {
                const newView: RoomView = "whiteboard";
                setView(newView);
                sendView(roomIdStr, { roomId: roomIdStr, view: newView, ts: Date.now() });
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-medium transition ${
              view === "whiteboard"
                ? "bg-white text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>✏️</span>
            <span>Whiteboard</span>
          </button>
        </div>

        {/* RIGHT: CONTROLS & USER PROFILE */}
        <div className="flex items-center gap-3 relative">
          {/* HOST APPROVAL MODAL */}
          {isHost && requests.length > 0 && (
            <div className="absolute top-12 right-24 bg-zinc-900 border border-white/[0.1] text-zinc-100 p-4 rounded-2xl shadow-2xl w-64 z-50 backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08]">
                <p className="text-xs font-semibold text-white">Join Requests ({requests.length})</p>
                <span className="text-[10px] text-amber-400 font-mono">Host Action</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {requests.map((r) => (
                  <div
                    key={r.userId}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-white/[0.04]"
                  >
                    <span className="text-xs text-zinc-200 truncate font-mono">{r.username}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => approveUser(r)}
                        className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center justify-center transition"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => rejectUser(r)}
                        className="w-6 h-6 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition"
                        title="Reject"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAT TOGGLE (MOBILE / DESKTOP) */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setUnreadCount(0);
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              isChatOpen
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-zinc-900 border-white/[0.08] text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <span>💬</span>
            <span className="hidden sm:inline">Chat</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* USER BADGE */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center shadow-inner">
              {username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-zinc-300 font-medium hidden md:inline">{username}</span>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {view === "editor" ? (
            <EditorPanel
              roomId={roomIdStr}
              userId={userId}
              code={code}
              setCode={setCode}
              typingUsers={typingUsers}
              isRemote={isRemote}
              output={output}
              language={language}
              setLanguage={setLanguage}
            />
          ) : (
            <WhiteboardCanvas roomId={roomIdStr} userId={userId} />
          )}
        </div>

        {/* CHAT DRAWER (DESKTOP) */}
        {isChatOpen && (
          <div className="hidden lg:flex w-80 shrink-0 h-full">
            <ChatPanel
              roomId={roomIdStr}
              userId={userId}
              username={username || ""}
              messages={messages}
            />
          </div>
        )}

        {/* CHAT DRAWER (MOBILE / OVERLAY) */}
        {isChatOpen && (
          <div className="lg:hidden absolute right-0 top-0 bottom-0 w-80 z-40 shadow-2xl">
            <ChatPanel
              roomId={roomIdStr}
              userId={userId}
              username={username || ""}
              messages={messages}
            />
          </div>
        )}
      </div>
    </div>
  );
}