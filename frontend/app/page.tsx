"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub);
      setIsLoggedIn(true);
    } catch (err) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // 🔥 LOAD LAST ROOM
  useEffect(() => {
    const saved = localStorage.getItem("lastRoom");
    if (saved) setLastRoom(saved);
  }, []);

  const goToRoom = (room: string) => {
    window.location.href = `/room/${room}`;
  };

  const isValidRoomId = (id: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  };

  // ✅ CREATE ROOM (FIXED)
  const createRoom = async () => {
    const cleanRoom = roomId.trim();

    if (cleanRoom && !isValidRoomId(cleanRoom)) {
      alert("❌ Invalid Room ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/create`, // ✅ FIXED
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: cleanRoom }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data}`);
        return;
      }

      goToRoom(data.roomId);

    } catch {
      alert("❌ Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  // ✅ JOIN ROOM (FIXED)
  const joinRoom = async () => {
    const cleanRoom = roomId.trim();

    if (!cleanRoom) {
      alert("❌ Enter room ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/exists/${cleanRoom}` // ✅ FIXED
      );

      const data = await res.json();

      if (data === false) {
        alert("❌ Room does not exist");
        return;
      }

      goToRoom(cleanRoom);

    } catch {
      alert("❌ Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">
          CodeCollab 🔥
        </h1>

        <p className="text-sm text-center text-green-400">
          👤 {userEmail}
        </p>

        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800"
        />

        <div className="flex gap-3">
          <button
            onClick={joinRoom}
            className="flex-1 py-2 bg-blue-600 rounded"
          >
            Join
          </button>

          <button
            onClick={createRoom}
            className="flex-1 py-2 bg-green-600 rounded"
          >
            Create
          </button>
        </div>

        {/* 🔥 REJOIN BUTTON */}
        {lastRoom && (
          <button
            onClick={() => goToRoom(lastRoom)}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Rejoin Last Room 🔁 ({lastRoom})
          </button>
        )}

      </div>
    </div>
  );
}