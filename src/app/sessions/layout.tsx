"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useParams } from "next/navigation";

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const params = useParams();
  const sessionId = (params?.id as string) || "";

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar - persists across session changes */}
      <Sidebar
        sessionId={sessionId}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      {/* Main Content - adjusts based on sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-12"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
