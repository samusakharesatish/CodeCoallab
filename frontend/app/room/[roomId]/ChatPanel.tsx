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
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-gray-800 text-sm text-gray-300 font-medium">
        💬 Chat
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isMe = m.userId === userId;

          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-xl text-sm max-w-[80%] shadow ${
                  isMe
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <div className="text-[10px] mb-1 text-gray-300">
                  {isMe ? "You" : m.username || m.userId}
                </div>

                <div>{m.message}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-gray-800">
        <input
          className="w-full bg-gray-800 px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-blue-500 outline-none"
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
      </div>
    </div>
  );
}