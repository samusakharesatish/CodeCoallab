"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // ✅ Always sync login state
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();

    // ✅ Listen for storage changes (logout/login in same tab issues)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");

    setIsLoggedIn(false); // ✅ immediate UI update
    router.push("/");
  };

  // ✅ Smart navigation
  const handleGoToApp = () => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-5xl font-bold mb-4 text-center">
        CodeCollab 🔥
      </h1>

      <p className="text-gray-400 text-center max-w-xl mb-8">
        Real-time collaborative coding platform with chat, live editing, and instant execution.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">

        {/* ✅ Go to App */}
        <button
          onClick={handleGoToApp}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          Go to App 🚀
        </button>

        {/* ✅ Show when NOT logged in */}
        {!isLoggedIn && (
          <>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Sign Up
            </button>
          </>
        )}

        {/* ✅ Show when logged in */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        )}

      </div>

      {/* FEATURES */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl">
        <div className="bg-gray-900 p-4 rounded-lg">
          ⚡ Real-time Code Sync
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          💬 Live Chat
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          🚀 Run Code Instantly
        </div>
      </div>

    </div>
  );
}