"use client";

import { useRef, useState, useEffect } from "react";
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
  isRemote,
}: any) {
  const editorRef = useRef<any>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Track the last version we sent to the server to prevent loops
  const lastAcknowledgedCode = useRef(code);

  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  // ✅ 1. REMOTE UPDATE SYNC
  // This effect listens for code changes from the socket (via the parent)
  useEffect(() => {
    if (isRemote.current && editorRef.current) {
      const editor = editorRef.current;
      const currentModelValue = editor.getValue();

      if (code !== currentModelValue) {
        // Save current cursor position so it doesn't jump
        const savedPosition = editor.getPosition();

        // Directly set value on the editor instance (fastest method)
        editor.setValue(code);

        // Restore cursor position
        if (savedPosition) {
          editor.setPosition(savedPosition);
        }

        lastAcknowledgedCode.current = code;
      }
      // Reset the lock
      isRemote.current = false;
    }
  }, [code, isRemote]);

  const handleChange = (value: string | undefined) => {
    const newCode = value || "";

    // ✅ FIX 1: reset isRemote properly
    if (isRemote.current) {
      isRemote.current = false;
      return;
    }

    // ✅ prevent unnecessary updates
    if (newCode === code) return;
    setCode(newCode);

    // 🚀 1. INSTANT SEND (main fix)
    if (newCode !== lastAcknowledgedCode.current) {
      sendCode(newCode, roomId, userId);
      lastAcknowledgedCode.current = newCode;
    }

    // 🧠 2. DEBOUNCE BACKUP (optional safety)
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      lastAcknowledgedCode.current = newCode;
    }, 200);

    // typing indicator
    sendTyping(roomId, userId, true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      sendTyping(roomId, userId, false);
    }, 1000);
  };
  const runCode = () => {
    setLoading(true);
    sendRun(roomId, {
      code,
      language,
      userId,
    });
    // Visual feedback for the run button
    setTimeout(() => setLoading(false), 1000);
  };

  // ✅ 4. OUTPUT FORMATTING (Your original logic)
  const formatOutput = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return (
        parsed.stdout || parsed.stderr || parsed.compile_output || "No output"
      );
    } catch {
      return raw;
    }
  };

  const activeTypingUsers = [...typingUsers].filter((u) => u !== userId);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              sendLanguage(roomId, {
                roomId,
                language: newLang,
                userId,
              });
            }}
            className="bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-lg border border-gray-300 outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            ▶ {loading ? "Running..." : "Run"}
          </button>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          👥 Live editing
        </div>
      </div>

      {/* TYPING INDICATOR */}
      {activeTypingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
          {activeTypingUsers.join(", ")} typing...
        </div>
      )}

      {/* MONACO EDITOR */}
      <div className="flex-1 border-b border-gray-200">
        <Editor
          height="100%"
          language={language}
          theme="vs-light"
          defaultValue={code} // ✅ IMPORTANT: Uncontrolled component prevents lag
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          onChange={handleChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      {/* OUTPUT SECTION */}
      <div className="h-44 border-t border-gray-200 bg-gray-50 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 text-xs">
          <span className="text-gray-600 font-medium">OUTPUT</span>

          <span className="flex items-center gap-1 text-green-600 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              }`}
            ></span>
            {loading ? "Running" : "Ready"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 text-gray-800 text-sm font-mono whitespace-pre-wrap">
          {output ? formatOutput(output) : "No output yet..."}
        </div>
      </div>
    </div>
  );
}
