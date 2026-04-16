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

  // ✅ LOAD LAST ROOM
useEffect(() => {
  const syncRoom = () => {
    const saved = localStorage.getItem("lastRoom");
    if (saved) {
      setLastRoom(saved);
    }
  };

  syncRoom();

  // 🔥 ensure updates reflect even after navigation
  window.addEventListener("focus", syncRoom);

  return () => window.removeEventListener("focus", syncRoom);
}, []);

  // 🔥 FIXED HERE
const goToRoom = (room: string) => {
  localStorage.setItem("lastRoom", room);
  setLastRoom(room); // 🔥 IMPORTANT (UI update immediately)
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
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white relative">

      <button
        onClick={handleLogout}
        className="absolute top-5 right-5 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
      >
        Logout
      </button>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">
          CodeCollab 🔥
        </h1>

        <p className="text-sm text-center text-green-400">
          👤 {userEmail}
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={generateRoomId}
            className="px-3 bg-purple-600 hover:bg-purple-700 rounded transition hover:scale-105"
          >
            🎲
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={joinRoom}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 rounded hover:scale-105 transition"
          >
            Join
          </button>

          <button
            onClick={createRoom}
            disabled={loading}
            className="flex-1 py-2 bg-green-600 rounded hover:scale-105 transition"
          >
            Create
          </button>
        </div>

        {lastRoom && (
          <button
            onClick={() => goToRoom(lastRoom)}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
          >
            Rejoin Last Room 🔁 ({lastRoom})
          </button>
        )}

      </div>
    </div>
  );
}