"use client";

import { useEffect, useRef } from "react";
import { sendChat } from "../../lib/socket";

type ChatMessage = {
  userId: string;
  username?: string;
  message: string;
  timestamp: string;
};

type ChatPanelProps = {
  roomId: string;
  userId: string;
  username: string;
  messages: ChatMessage[];
};

export default function ChatPanel({
  roomId,
  userId,
  username,
  messages,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputRef.current && inputRef.current.value.trim()) {
      sendChat(roomId, {
        userId,
        username,
        message: inputRef.current.value.trim(),
        timestamp: new Date().toISOString(),
      });
      inputRef.current.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/80 backdrop-blur-2xl border-l border-white/[0.08] text-zinc-100">
      {/* HEADER */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/30 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-tight text-white">Team Chat</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
          {messages.length} msgs
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
            <span className="text-xl mb-1">💬</span>
            <p>No messages yet.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Start the conversation with your team.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.userId === userId;

            return (
              <div
                key={i}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mb-1 px-1">
                  <span className="text-zinc-400 font-medium">
                    {isMe ? "You" : m.username || m.userId}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-xs"
                      : "bg-zinc-900/90 border border-white/[0.08] text-zinc-200 rounded-bl-xs"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t border-white/[0.06] bg-zinc-900/20">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            className="flex-1 bg-zinc-900/90 border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 transition"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition flex items-center justify-center shadow-md shrink-0"
            title="Send Message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
