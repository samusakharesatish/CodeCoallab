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
    Object.values(remoteStrokesRef.current).forEach((item) => renderItem(ctx, item));

    if (activeStrokeRef.current) {
      renderItem(ctx, activeStrokeRef.current);
    }

    if (previewRef.current) {
      renderItem(ctx, previewRef.current);
    }
  }, [renderItem]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const applyRemoteEvent = useCallback((data: DrawEventPayload) => {
    if (data.roomId && data.roomId !== roomId) return;
    if (data.userId === userId) return;

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
  }, [redrawCanvas, roomId, userId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";

    ctxRef.current = ctx;

    pendingEvents.current.forEach((event) => applyRemoteEvent(event));
    pendingEvents.current = [];

    redrawCanvas();
  }, [applyRemoteEvent, redrawCanvas, roomId, userId]);

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

    return () => {
      window.removeEventListener("draw-event", handler);
    };
  }, [applyRemoteEvent, roomId, userId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    setDrawing(true);

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
        tool,
        userId,
      });
      return;
    }

    if (previewRef.current) {
      const finalizedShape = previewRef.current;
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
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex gap-2 p-3 border-b bg-gray-100">
        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-1 rounded ${
            tool === "pen"
              ? "bg-indigo-500 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          Pen
        </button>

        <button
          onClick={() => setTool("rect")}
          className={`px-3 py-1 rounded ${
            tool === "rect"
              ? "bg-indigo-500 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          Rect
        </button>

        <button
          onClick={() => setTool("circle")}
          className={`px-3 py-1 rounded ${
            tool === "circle"
              ? "bg-indigo-500 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          Circle
        </button>

        <button
          onClick={clearCanvas}
          className="ml-auto px-3 py-1 rounded bg-red-500 text-white"
        >
          Clear
        </button>
      </div>

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
