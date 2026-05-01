"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import ChatPanel from "./ChatPanel";
import EditorPanel from "./EditorPanel";
import WhiteboardCanvas from "./WhiteboardCanvas";
import { connectSocket, sendView } from "../../lib/socket";

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

type DrawEventPayload = {
  userId?: string;
};

type CodeEventPayload = {
  userId?: string;
  code?: string;
};

type TypingEventPayload = {
  userId: string;
  isTyping: boolean;
};

type LanguageEventPayload = {
  language?: string;
};

type RunEventPayload = {
  output?: string;
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId;
  const roomIdStr = typeof roomId === "string" ? roomId : "";

  const [code, setCode] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [view, setView] = useState<RoomView>("editor");

  // ✅ NEW STATE (chat toggle)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isRemote = useRef(false);

  useEffect(() => {
    let session = sessionStorage.getItem("sessionId");

    if (!session) {
      session = Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem("sessionId", session);
    }

    setSessionId(session);
  }, []);

  useEffect(() => {
    if (roomIdStr) {
      localStorage.setItem("lastRoom", roomIdStr);
    }
  }, [roomIdStr]);

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

  useEffect(() => {
    if (!roomIdStr || !userId || !sessionId) return;

    connectSocket(roomIdStr, {
      userId,
      sessionId,

      onDraw: (data: DrawEventPayload) => {
        window.dispatchEvent(new CustomEvent("draw-event", { detail: data }));
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
        console.log("Language:", data.language);
      },

      onRun: (data: RunEventPayload) => {
        setOutput(data.output ?? "");
      },

      onUsers: (data: string[]) => {
        setOnlineUsers([...data]);
      },

      onView: (data: ViewSyncPayload) => {
        if (data.roomId !== roomIdStr) return;
        setView(data.view);
      },
    });
  }, [roomIdStr, sessionId, userId]);

  useEffect(() => {
    if (!roomIdStr) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room/${roomIdStr}`,
        );

        if (!res.ok) return;

        let data;
        try {
          data = await res.json();
        } catch {
          data = "EMPTY";
        }

        if (data !== "EMPTY") {
          setCode(data.code || "");
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("ROOM FETCH ERROR:", err);
      }
    };

    fetchRoom();
  }, [roomIdStr]);

  if (!roomIdStr || !userId) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-100">
            <span className="text-indigo-600 text-lg font-bold">{`</>`}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm font-medium">Room</span>
            <span className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-600 font-semibold">
              {roomIdStr}
            </span>

            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {onlineUsers.length > 0 ? onlineUsers.length : 1} online
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* CHAT BUTTON */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setUnreadCount(0);
            }}
            className="relative px-2 py-1 text-xs rounded-md bg-indigo-700 text-white hover:bg-indigo-600"
          >
            💬 Chat
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* COPY */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("🔗 Link copied!");
            }}
            className="px-2 py-1 text-xs rounded-md bg-indigo-700 text-white hover:bg-indigo-600"
          >
            📋 Copy
          </button>

          {/* WB */}
          <button
            onClick={() => {
              const newView: RoomView =
                view === "editor" ? "whiteboard" : "editor";

              const payload: ViewSyncPayload = {
                roomId: roomIdStr,
                view: newView,
                ts: Date.now(),
              };

              setView(newView);
              sendView(roomIdStr, payload);
            }}
            className="px-2 py-1 text-xs rounded-md bg-indigo-700 text-white hover:bg-indigo-600"
          >
            {view === "editor" ? "🖊 WB" : "💻 Code"}
          </button>

          {/* USER */}
          <div className="hidden sm:block ml-6">
            <p className="text-sm text-gray-900 font-semibold">{username}</p>
          </div>

          {/* AVATAR */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-semibold">
            {username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* EDITOR */}
        <div className="flex-1 flex flex-col">
          {view === "editor" ? (
            <EditorPanel
              roomId={roomIdStr}
              userId={userId}
              code={code}
              setCode={setCode}
              typingUsers={typingUsers}
              isRemote={isRemote}
              output={output}
            />
          ) : (
            <WhiteboardCanvas roomId={roomIdStr} userId={userId} />
          )}
        </div>

        {/* DESKTOP CHAT */}
        <div className="hidden lg:flex w-[320px] border-l border-gray-200 bg-white flex-col">
          <ChatPanel
            roomId={roomIdStr}
            userId={userId}
            username={username || ""}
            messages={messages}
          />
        </div>

        {/* MOBILE / SMALL SCREEN CHAT */}
        {isChatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white border-l border-gray-300 z-40 flex flex-col">
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
