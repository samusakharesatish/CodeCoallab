"use client";

import { useRef, useEffect, useState } from "react";
import { sendDraw} from "../../lib/socket";

type Tool = "pen" | "rect" | "circle";

export default function WhiteboardCanvas({ roomId, userId }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");

  // 🔥 track last point for smooth drawing
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const pendingEvents = useRef<any[]>([]);

  // 🎨 INIT CANVAS
 useEffect(() => {
  const canvas = canvasRef.current!;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";

  ctxRef.current = ctx;

  // 🔥 process pending events
  pendingEvents.current.forEach((data) => {
    if (data.userId === userId) return;

    if (data.type === "start") {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    }

    if (data.type === "draw") {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }

    if (data.type === "end") {
      ctx.closePath();
    }

    if (data.type === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  pendingEvents.current = [];
}, []);

  // 🟢 START DRAW
  const startDrawing = (e: React.MouseEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);

    lastPoint.current = { x, y };
    setDrawing(true);

    // ✅ send start event
    sendDraw(roomId, {
      type: "start",
      x,
      y,
      tool,
      userId,
    });
  };

  // 🟢 DRAW
  const draw = (e: React.MouseEvent) => {
    if (!drawing) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === "pen") {
      ctx.lineTo(x, y);
      ctx.stroke();

      // ✅ send draw event
      sendDraw(roomId, {
        type: "draw",
        x,
        y,
        tool,
        userId,
      });
    }

    lastPoint.current = { x, y };
  };

  // 🟢 STOP DRAW
  const stopDrawing = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.closePath();
    setDrawing(false);
    lastPoint.current = null;

    // ✅ send end event
    sendDraw(roomId, {
      type: "end",
      userId,
    });
  };

  // 🔥 RECEIVE DRAW FROM OTHER USERS / TABS
 useEffect(() => {
  const handler = (e: any) => {
    const data = e.detail;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    // ❌ canvas not ready → store event
    if (!ctx || !canvas) {
      pendingEvents.current.push(data);
      return;
    }

    if (data.userId === userId) return;

    if (data.type === "start") {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    }

    if (data.type === "draw") {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }

    if (data.type === "end") {
      ctx.closePath();
    }

    if (data.type === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  window.addEventListener("draw-event", handler);

  return () => {
    window.removeEventListener("draw-event", handler);
  };
}, [userId]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* TOOLBAR */}
      <div className="flex gap-2 p-3 border-b bg-gray-100">
        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-1 rounded ${
            tool === "pen" ? "bg-indigo-500 text-white" : "bg-white"
          }`}
        >
          ✏ Pen
        </button>

        <button
          onClick={() => setTool("rect")}
          className="px-3 py-1 rounded bg-white"
        >
          ⬛ Rect
        </button>

        <button
          onClick={() => setTool("circle")}
          className="px-3 py-1 rounded bg-white"
        >
          ⚪ Circle
        </button>

        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ✅ sync clear across tabs
            sendDraw(roomId, {
              type: "clear",
              userId,
            });
          }}
          className="ml-auto px-3 py-1 rounded bg-red-500 text-white"
        >
          🧹 Clear
        </button>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}