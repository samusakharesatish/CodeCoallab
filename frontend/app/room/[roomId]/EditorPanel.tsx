"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { sendCode, sendTyping, sendLanguage, sendRun } from "../../lib/socket";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function EditorPanel({
  roomId,
  userId,
  code,
  setCode,
  typingUsers,
  output,
}: any) {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string | undefined) => {
    const newCode = value || "";
    if (newCode === code) return;

    setCode(newCode);

    sendCode(newCode, roomId, 0);
    sendTyping(roomId, userId, true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      sendTyping(roomId, userId, false);
    }, 1000);
  };

  // 🔥 REAL-TIME RUN
  const runCode = () => {
    setLoading(true);

    sendRun(roomId, {
      code,
      language,
      userId,
    });

    setTimeout(() => setLoading(false), 1000);
  };

  // 🔥 NEW: FORMAT OUTPUT
  const formatOutput = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);

      return (
        parsed.stdout ||
        parsed.stderr ||
        parsed.compile_output ||
        "No output"
      );
    } catch {
      return raw;
    }
  };

  const activeTypingUsers = [...typingUsers].filter((u) => u !== userId);

  return (
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#020617] border-b border-gray-800">
        <div className="flex items-center gap-3">

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);

              sendLanguage(roomId, {
                roomId,
                language: e.target.value,
                userId,
              });
            }}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700"
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={runCode}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded transition"
          >
            {loading ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>

      {/* TYPING */}
      {activeTypingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-400 bg-[#020617] border-b border-gray-800">
          {activeTypingUsers.join(", ")} typing...
        </div>
      )}

      {/* EDITOR */}
      <div className="flex-1 border-b border-gray-800">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleChange}
        />
      </div>

      {/* OUTPUT */}
      <div className="h-44 border-t border-gray-800 bg-black flex flex-col">
        <div className="flex items-center justify-between px-3 py-1 bg-[#020617] border-b border-gray-800 text-xs text-gray-400">
          <span>OUTPUT</span>
          <span className="text-green-500">
            {loading ? "Running..." : "Ready"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 text-green-400 text-sm font-mono whitespace-pre-wrap">
          {output ? formatOutput(output) : "No output yet..."}
        </div>
      </div>
    </div>
  );
}