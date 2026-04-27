"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub);
      setIsLoggedIn(true);
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const syncRoom = () => {
      const saved = localStorage.getItem("lastRoom");
      if (saved) setLastRoom(saved);
    };

    syncRoom();
    window.addEventListener("focus", syncRoom);
    return () => window.removeEventListener("focus", syncRoom);
  }, []);

  const goToRoom = (room: string) => {
    localStorage.setItem("lastRoom", room);
    setLastRoom(room);
    window.location.href = `/room/${room}`;
  };

  const isValidRoomId = (id: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");

    toast.success("Logged out 👋");

    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const generateRoomId = () => {
    const id = "room-" + Math.random().toString(36).substring(2, 8);
    setRoomId(id);
    toast.success("Room ID generated 🎲");
  };

  const createRoom = async () => {
    let cleanRoom = roomId.trim();

    if (!cleanRoom) {
      cleanRoom = "room-" + Math.random().toString(36).substring(2, 8);
      setRoomId(cleanRoom);
    }

    if (!isValidRoomId(cleanRoom)) {
      toast.error("Invalid Room ID ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: cleanRoom }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data || "Failed to create room ❌");
        return;
      }

      toast.success("Room created 🚀");
      goToRoom(data.roomId);

    } catch {
      toast.error("Cannot connect to backend ❌");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    const cleanRoom = roomId.trim();

    if (!cleanRoom) {
      toast.error("Enter room ID ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/exists/${cleanRoom}`
      );

      const data = await res.json();

      if (data === false) {
        toast.error("Room does not exist ❌");
        return;
      }

      toast.success("Joining room 🚀");
      goToRoom(cleanRoom);

    } catch {
      toast.error("Cannot connect to backend ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-8 py-4 border-b bg-white/80 backdrop-blur">
        <h1 className="text-xl font-bold">CodeCollab 🔥</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👤 {userEmail}</span>

          <button
            onClick={handleLogout}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 items-center justify-center px-6">

        <div className="w-full max-w-md bg-white border rounded-2xl shadow-xl p-8 space-y-6">

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Join or Create Room
            </h2>
            <p className="text-gray-500 text-sm">
              Start collaborating in real-time with your team
            </p>
          </div>

          {/* INPUT */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none"
            />

            <button
              onClick={generateRoomId}
              className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              🎲
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={joinRoom}
              disabled={loading}
              className="flex-1 py-3 bg-black text-white rounded-lg hover:scale-105 transition"
            >
              Join
            </button>

            <button
              onClick={createRoom}
              disabled={loading}
              className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:scale-105 transition"
            >
              Create
            </button>
          </div>

          {/* LAST ROOM */}
          {lastRoom && (
            <button
              onClick={() => goToRoom(lastRoom)}
              className="w-full py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            >
              🔁 Rejoin Last Room ({lastRoom})
            </button>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-4 text-gray-400 text-sm">
        Real-time collaboration made simple 🚀
      </div>

    </div>
  );
}