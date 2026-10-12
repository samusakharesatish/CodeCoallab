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

  const lastAcknowledgedCode = useRef(code);
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // Sync remote changes
  useEffect(() => {
    if (isRemote.current && editorRef.current) {
      const editor = editorRef.current;
      const currentModelValue = editor.getValue();

      if (code !== currentModelValue) {
        const savedPosition = editor.getPosition();
        editor.setValue(code);
        if (savedPosition) {
          editor.setPosition(savedPosition);
        }
        lastAcknowledgedCode.current = code;
      }
      isRemote.current = false;
    }
  }, [code, isRemote]);

  const handleChange = (value: string | undefined) => {
    const newCode = value || "";

    if (isRemote.current) {
      isRemote.current = false;
      return;
    }

    if (newCode === code) return;
    setCode(newCode);

    if (newCode !== lastAcknowledgedCode.current) {
      sendCode(newCode, roomId, userId);
      lastAcknowledgedCode.current = newCode;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastAcknowledgedCode.current = newCode;
    }, 200);

    sendTyping(roomId, userId, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendTyping(roomId, userId, false);
    }, 1000);
  };

  const runCode = () => {
    setLoading(true);
    setIsConsoleOpen(true);
    sendRun(roomId, {
      code,
      language,
      userId,
    });
    setTimeout(() => setLoading(false), 800);
  };

  const formatOutput = (raw: string) => {
    if (!raw) return "Press 'Run' to execute code and view output here.";
    try {
      const parsed = JSON.parse(raw);
      return (
        parsed.stdout || parsed.stderr || parsed.compile_output || raw
      );
    } catch {
      return raw;
    }
  };

  const activeTypingUsers = Array.from(typingUsers || []).filter(
    (u) => u !== userId
  ) as string[];

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* TOOLBAR */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-md select-none">
        {/* Left: Language & Run */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span>Lang:</span>
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
              className="bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs px-2.5 py-1 rounded-lg outline-none font-mono focus:border-indigo-500/80 transition"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <span>{loading ? "⟳" : "▶"}</span>
            <span>{loading ? "Running..." : "Run"}</span>
          </button>
        </div>

        {/* Right: Typing indicators & Console toggle */}
        <div className="flex items-center gap-3">
          {activeTypingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>{activeTypingUsers.join(", ")} typing...</span>
            </div>
          )}

          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
              isConsoleOpen
                ? "bg-white/[0.08] text-zinc-200 border-white/[0.12]"
                : "text-zinc-500 hover:text-zinc-300 border-transparent"
            }`}
          >
            Terminal {isConsoleOpen ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* MONACO CODE EDITOR */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>

      {/* CONSOLE DRAWER */}
      {isConsoleOpen && (
        <div className="h-44 border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl flex flex-col font-mono text-xs shadow-2xl">
          <div className="h-8 px-4 flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/40 text-zinc-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">Execution Output</span>
            </div>
            <button
              onClick={() => setIsConsoleOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 text-[10px]"
            >
              Minimize ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-zinc-300 whitespace-pre-wrap leading-relaxed select-text font-mono text-[12px]">
            {formatOutput(output)}
          </div>
        </div>
      )}
    </div>
  );
}
