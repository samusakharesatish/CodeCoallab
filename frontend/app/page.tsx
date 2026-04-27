"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastRoom");
    setIsLoggedIn(false);
    router.push("/");
  };

  const handleGoToApp = () => {
    const token = localStorage.getItem("token");
    router.push(token ? "/home" : "/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="relative overflow-hidden">

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-orange-50" />

        {/* Glow effects */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 py-24">

          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
            CodeCollab <span className="text-orange-500">🔥</span>
          </h1>

          <p className="text-gray-600 max-w-2xl text-lg mb-10">
            Real-time collaborative coding with chat, execution, and whiteboard —
            built for modern developers and teams.
          </p>

          {/* CTA */}
          <div className="flex gap-4 flex-wrap justify-center">

            <button
              onClick={handleGoToApp}
              className="px-7 py-3 bg-black text-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all"
            >
              🚀 Go to App
            </button>

            {!isLoggedIn && (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-7 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => router.push("/register")}
                  className="px-7 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition"
                >
                  Sign Up
                </button>
              </>
            )}

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-7 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}

          </div>

          {/* GLASS CARD */}
          <div className="mt-16 backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-2xl p-6 max-w-3xl w-full">
            <p className="text-gray-700">
              ⚡ Code together in real-time • 💬 Chat instantly • 🚀 Execute code • 🧠 Draw ideas on whiteboard
            </p>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">

        {[
          {
            title: "⚡ Real-time Sync",
            desc: "Collaborate with multiple users editing the same code instantly with zero lag."
          },
          {
            title: "💬 Live Chat",
            desc: "Communicate with your team while coding to stay aligned and productive."
          },
          {
            title: "🚀 Instant Execution",
            desc: "Run and test code in real-time without leaving the collaborative environment."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all"
          >
            <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}

      </section>

      {/* WHITEBOARD */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-24 px-6">

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-bold mb-5">
              🧠 Visual Collaboration with Whiteboard
            </h2>

            <p className="text-gray-600 mb-6">
              Go beyond code. Design systems, explain logic, and brainstorm ideas
              with your team in real-time using an integrated collaborative whiteboard.
            </p>

            <ul className="space-y-3 text-gray-700">
              <li>✨ Draw diagrams & workflows</li>
              <li>✨ Plan system architecture visually</li>
              <li>✨ Collaborate in real-time</li>
              <li>✨ Perfect for interviews & team discussions</li>
            </ul>
          </div>

          {/* RIGHT VISUAL */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border relative">

            <div className="h-64 flex items-center justify-center text-gray-400 text-lg">
              Whiteboard Canvas Preview ✏️
            </div>

            <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm shadow">
              Live
            </div>

          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="text-center py-20 px-6">

        <h2 className="text-4xl font-bold mb-4">
          Start Collaborating Today 🚀
        </h2>

        <p className="text-gray-600 mb-8">
          Experience real-time coding like never before.
        </p>

        <button
          onClick={handleGoToApp}
          className="px-8 py-4 bg-black text-white rounded-xl shadow-lg hover:scale-105 transition"
        >
          Launch CodeCollab
        </button>

      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} CodeCollab — Built with ❤️ for developers
      </footer>

    </div>
  );
}