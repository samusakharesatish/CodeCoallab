"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { sendCode, sendTyping, sendLanguage } from "../../lib/socket";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const languageMap: any = {
  javascript: 63,
  java: 62,
  python: 71,
};

export default function EditorPanel({
  roomId,
  userId,
  code,
  setCode,
  typingUsers,
}: any) {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string | undefined) => {
    const newCode = value || "";
    if (newCode === code) return;

    setCode(newCode);

    sendCode(roomId, { code: newCode, cursorPosition: 0, userId });

    sendTyping(roomId, { userId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      sendTyping(roomId, { userId, isTyping: false });
    }, 1000);
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");

    try {
      const res = await fetch("http://localhost:8080/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language_id: languageMap[language],
        }),
      });

      const data = await res.json();

      setOutput(
        data.stdout ||
        data.stderr ||
        data.compile_output ||
        "No output"
      );
    } catch {
      setOutput("Error running code");
    }

    setLoading(false);
  };

  const activeTypingUsers = [...typingUsers].filter((u) => u !== userId);

  return (
    <div className="flex-1 flex flex-col">

      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#020617] border-b border-gray-800">
        <div className="flex items-center gap-3">

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              sendLanguage(roomId, { language: e.target.value, userId });
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

      {/* 🔥 TYPING */}
      {activeTypingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-400 bg-[#020617] border-b border-gray-800">
          {activeTypingUsers.join(", ")} typing...
        </div>
      )}

      {/* 🔥 EDITOR */}
      <div className="flex-1 border-b border-gray-800">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleChange}
        />
      </div>

      {/* 🔥 IMPROVED OUTPUT PANEL */}
      <div className="h-44 border-t border-gray-800 bg-black flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#020617] border-b border-gray-800 text-xs text-gray-400">
          <span>OUTPUT</span>

          <span className="text-green-500">
            {loading ? "Running..." : "Ready"}
          </span>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 text-green-400 text-sm font-mono whitespace-pre-wrap scroll-smooth">
          {output || "No output yet..."}
        </div>

      </div>
    </div>
  );
}