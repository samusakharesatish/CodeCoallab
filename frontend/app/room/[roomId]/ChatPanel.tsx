"use client";

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
  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          💬 Chat
        </div>

        {/* Online Count (UI only) */}
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">
          {messages.length}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, i) => {
          const isMe = m.userId === userId;

          return (
            <div key={i} className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-semibold text-sm ${
                  isMe ? "bg-green-500" : "bg-orange-400"
                }`}
              >
                {(isMe ? username : m.username || m.userId)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* Message */}
              <div className="flex flex-col max-w-[75%]">
                {/* Name + Time */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="font-medium text-gray-800">
                    {isMe ? "You" : m.username || m.userId}
                  </span>
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-indigo-100 text-gray-900"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm border border-gray-300 outline-none 
  text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                sendChat(roomId, {
                  userId,
                  username,
                  message: e.currentTarget.value,
                  timestamp: new Date().toISOString(),
                });
                e.currentTarget.value = "";
              }
            }}
          />

          {/* Send Button */}
          <button
            onClick={(e: any) => {
              const input = e.currentTarget.previousSibling;
              if (input && input.value.trim()) {
                sendChat(roomId, {
                  userId,
                  username,
                  message: input.value,
                  timestamp: new Date().toISOString(),
                });
                input.value = "";
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
