"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "../../lib/socket";

import EditorPanel from "./EditorPanel";
import ChatPanel from "./ChatPanel";
import toast from "react-hot-toast";

type ChatMessage = {
  userId: string;
  message: string;
  timestamp: string;
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId;

  if (!roomId) return null;

  const roomIdStr = roomId as string;

  const [code, setCode] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [output, setOutput] = useState(""); // ✅ NEW

  const isRemote = useRef(false);

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
    if (!roomIdStr || !userId) return;

    connectSocket(roomIdStr, {
      onCode: (data: any) => {
        isRemote.current = true;

        setCode((prev) => {
          if (data.code !== undefined && data.code !== prev) {
            return data.code;
          }
          return prev;
        });
      },

      onTyping: (data: any) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          data.isTyping
            ? updated.add(data.userId)
            : updated.delete(data.userId);
          return updated;
        });
      },

      onChat: (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);
      },

      onLanguage: (data: any) => {
        console.log("Language:", data.language);
      },

      // 🔥 NEW
      onRun: (data: any) => {
        setOutput(data.output);
      },
    });
  }, [roomIdStr, userId]);

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

  if (!userId) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
        <div className="text-sm text-gray-300">
          Room: <span className="text-blue-400">{roomIdStr}</span>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("🔗 Link copied!");
          }}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Copy Link
        </button>

        <div className="flex items-center gap-2 max-w-[180px]">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
            {username?.charAt(0).toUpperCase()}
          </div>

          <span className="text-gray-300 text-sm truncate">{username}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <EditorPanel
            roomId={roomIdStr}
            userId={userId}
            code={code}
            setCode={setCode}
            typingUsers={typingUsers}
            isRemote={isRemote}
            output={output} // ✅ NEW
          />
        </div>

        <div className="w-[320px] border-l border-gray-800 bg-gray-900 flex flex-col">
          <ChatPanel
            roomId={roomIdStr}
            userId={userId}
            username={username || ""}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}