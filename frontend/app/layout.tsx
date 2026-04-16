import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "CodeCollab",
  description: "Real-time collaborative code editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-white min-h-screen antialiased">

        {/* 🔥 APP WRAPPER */}
        <div className="min-h-screen flex flex-col">

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {children}
          </main>

        </div>

        {/* 🔥 GLOBAL TOAST (INDUSTRY LEVEL UI) */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#020617",
              color: "#fff",
              border: "1px solid #1f2937",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#020617",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#020617",
              },
            },
          }}
        />

      </body>
    </html>
  );
}