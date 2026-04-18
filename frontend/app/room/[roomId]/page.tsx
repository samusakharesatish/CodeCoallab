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
  const [output, setOutput] = useState("");

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
        // ✅ FIX 1: Ignore messages sent by yourself to stop the "Echo Loop"
        if (data.userId === userId) return;

        // ✅ FIX 2: Set isRemote to true BEFORE updating state
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
          `${process.env.NEXT_PUBLIC_API_URL}/room/${roomIdStr}`
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
      {/* 🔥 WHITE HEADER */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-100">
            <span className="text-indigo-600 text-lg font-bold">{`</>`}</span>
          </div>

          {/* Room Info */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm font-medium">Room</span>
            <span className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-600 font-semibold">
              {roomIdStr}
            </span>

            {/* Online */}
            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              2 online
            </span>
          </div>
        </div>

        {/* CENTER */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("🔗 Link copied!");
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition shadow-sm"
        >
          📋 Copy Link
        </button>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-900 font-semibold">{username}</p>
            <p className="text-xs text-gray-500">Owner</p>
          </div>

          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-semibold shadow-sm">
            {username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <EditorPanel
            roomId={roomIdStr}
            userId={userId}
            code={code}
            setCode={setCode}
            typingUsers={typingUsers}
            isRemote={isRemote}
            output={output}
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