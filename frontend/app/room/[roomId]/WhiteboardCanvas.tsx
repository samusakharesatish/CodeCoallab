"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendDraw } from "../../lib/socket";

type Tool = "pen" | "rect" | "circle";

type Point = {
  x: number;
  y: number;
};

type PenStroke = {
  tool: "pen";
  points: Point[];
};

type Shape = {
  tool: "rect" | "circle";
  start: Point;
  end: Point;
};

type CanvasItem = PenStroke | Shape;

type DrawEventPayload = {
  roomId?: string;
  userId?: string;
  type: "start" | "draw" | "end" | "clear" | "shape";
  tool?: Tool;
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
};

type WhiteboardCanvasProps = {
  roomId: string;
  userId: string;
};

export default function WhiteboardCanvas({
  roomId,
  userId,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const elementsRef = useRef<CanvasItem[]>([]);
  const previewRef = useRef<Shape | null>(null);
  const activeStrokeRef = useRef<PenStroke | null>(null);
  const shapeStartRef = useRef<Point | null>(null);
  const remoteStrokesRef = useRef<Record<string, PenStroke>>({});
  const pendingEvents = useRef<DrawEventPayload[]>([]);

  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");

  const drawRect = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      ctx.strokeRect(x, y, width, height);
    },
    [],
  );

  const drawCircle = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radius =
        Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    },
    [],
  );

  const renderItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItem) => {
    if (item.tool === "pen") {
      if (item.points.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);

      item.points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      if (item.points.length === 1) {
        ctx.lineTo(item.points[0].x, item.points[0].y);
      }

      ctx.stroke();
      ctx.closePath();
      return;
    }

    if (item.tool === "rect") {
      drawRect(ctx, item.start, item.end);
      return;
    }

    drawCircle(ctx, item.start, item.end);
  }, [drawCircle, drawRect]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elementsRef.current.forEach((item) => renderItem(ctx, item));

    Object.values(remoteStrokesRef.current).forEach((stroke) => {
      renderItem(ctx, stroke);
    });

    if (activeStrokeRef.current) {
      renderItem(ctx, activeStrokeRef.current);
    }

    if (previewRef.current) {
      renderItem(ctx, previewRef.current);
    }
  }, [renderItem]);

  const applyRemoteEvent = useCallback((data: DrawEventPayload) => {
    if (data.type === "clear") {
      elementsRef.current = [];
      previewRef.current = null;
      activeStrokeRef.current = null;
      remoteStrokesRef.current = {};
      redrawCanvas();
      return;
    }

    if (data.type === "shape") {
      if (
        (data.tool !== "rect" && data.tool !== "circle") ||
        data.startX === undefined ||
        data.startY === undefined ||
        data.endX === undefined ||
        data.endY === undefined
      ) {
        return;
      }

      elementsRef.current.push({
        tool: data.tool,
        start: { x: data.startX, y: data.startY },
        end: { x: data.endX, y: data.endY },
      });
      redrawCanvas();
      return;
    }

    const remoteUserId = data.userId;
    if (!remoteUserId) return;

    if (data.type === "start") {
      if (data.tool !== "pen" || data.x === undefined || data.y === undefined) return;

      remoteStrokesRef.current[remoteUserId] = {
        tool: "pen",
        points: [{ x: data.x, y: data.y }],
      };
      redrawCanvas();
      return;
    }

    if (data.type === "draw") {
      if (data.x === undefined || data.y === undefined) return;

      const activeStroke = remoteStrokesRef.current[remoteUserId];
      if (!activeStroke) return;

      activeStroke.points.push({ x: data.x, y: data.y });
      redrawCanvas();
      return;
    }

    if (data.type === "end") {
      const completedStroke = remoteStrokesRef.current[remoteUserId];
      if (!completedStroke) return;

      elementsRef.current.push(completedStroke);
      delete remoteStrokesRef.current[remoteUserId];
      redrawCanvas();
    }
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f4f4f5"; // Crisp light stroke for dark mode

    ctxRef.current = ctx;

    pendingEvents.current.forEach((event) => applyRemoteEvent(event));
    pendingEvents.current = [];

    redrawCanvas();
  }, [applyRemoteEvent, redrawCanvas]);

  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent<DrawEventPayload>).detail;

      if (!ctxRef.current || !canvasRef.current) {
        pendingEvents.current.push(data);
        return;
      }

      applyRemoteEvent(data);
    };

    window.addEventListener("draw-event", handler);
    return () => window.removeEventListener("draw-event", handler);
  }, [applyRemoteEvent]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const point = getCanvasPoint(e);

    if (tool === "pen") {
      activeStrokeRef.current = {
        tool: "pen",
        points: [point],
      };

      redrawCanvas();

      sendDraw(roomId, {
        type: "start",
        x: point.x,
        y: point.y,
        tool,
        userId,
      });
      return;
    }

    shapeStartRef.current = point;
    previewRef.current = {
      tool,
      start: point,
      end: point,
    };
    redrawCanvas();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;

    const point = getCanvasPoint(e);

    if (tool === "pen") {
      const activeStroke = activeStrokeRef.current;
      if (!activeStroke) return;

      activeStroke.points.push(point);
      redrawCanvas();

      sendDraw(roomId, {
        type: "draw",
        x: point.x,
        y: point.y,
        tool,
        userId,
      });
      return;
    }

    const start = shapeStartRef.current;
    if (!start) return;

    previewRef.current = {
      tool,
      start,
      end: point,
    };
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (!drawing) return;

    setDrawing(false);

    if (tool === "pen") {
      const activeStroke = activeStrokeRef.current;
      if (activeStroke) {
        elementsRef.current.push(activeStroke);
      }

      activeStrokeRef.current = null;
      redrawCanvas();

      sendDraw(roomId, {
        type: "end",
        userId,
      });
      return;
    }

    const start = shapeStartRef.current;
    const preview = previewRef.current;

    if (start && preview) {
      const finalizedShape: Shape = {
        tool,
        start,
        end: preview.end,
      };

      elementsRef.current.push(finalizedShape);

      sendDraw(roomId, {
        type: "shape",
        tool: finalizedShape.tool,
        startX: finalizedShape.start.x,
        startY: finalizedShape.start.y,
        endX: finalizedShape.end.x,
        endY: finalizedShape.end.y,
        userId,
      });
    }

    previewRef.current = null;
    shapeStartRef.current = null;
    redrawCanvas();
  };

  const clearCanvas = () => {
    elementsRef.current = [];
    previewRef.current = null;
    activeStrokeRef.current = null;
    remoteStrokesRef.current = {};
    redrawCanvas();

    sendDraw(roomId, {
      type: "clear",
      userId,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] relative overflow-hidden select-none">
      {/* FLOATING GLASS DOCK TOOLBAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-white/[0.08] backdrop-blur-2xl shadow-2xl">
        <button
          onClick={() => setTool("pen")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            tool === "pen"
              ? "bg-white text-zinc-950 shadow-md font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
          }`}
        >
          <span>✏️</span>
          <span>Pen</span>
        </button>

        <button
          onClick={() => setTool("rect")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            tool === "rect"
              ? "bg-white text-zinc-950 shadow-md font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
          }`}
        >
          <span>▭</span>
          <span>Rectangle</span>
        </button>

        <button
          onClick={() => setTool("circle")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            tool === "circle"
              ? "bg-white text-zinc-950 shadow-md font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
          }`}
        >
          <span>◯</span>
          <span>Circle</span>
        </button>

        <div className="h-4 w-px bg-white/[0.1] mx-1" />

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
          title="Clear Whiteboard"
        >
          <span>✕</span>
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* CANVAS WITH DOT-GRID BACKGROUND */}
      <div className="flex-1 w-full h-full bg-dot-grid relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
