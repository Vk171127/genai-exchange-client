"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FileText,
  X,
  ChevronRight,
  Map,
} from "lucide-react";

interface SitemapProps {
  currentSessionId?: string;
}

export default function Sitemap({ currentSessionId }: SitemapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Landing page",
      disabled: false,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "View all sessions",
      disabled: false,
    },
    {
      name: "Current Session",
      path: currentSessionId ? `/sessions/${currentSessionId}` : null,
      icon: FileText,
      description: "Active workflow",
      disabled: !currentSessionId,
    },
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === "/") return pathname === "/";
    // For session paths, check if we're on any session page
    if (path.startsWith("/sessions/")) {
      return pathname?.startsWith("/sessions/");
    }
    return pathname?.startsWith(path);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
        aria-label="Open sitemap"
      >
        <Map className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Sitemap Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Navigation</h2>
                  <p className="text-slate-400 text-sm">
                    Quick access to all pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (!item.disabled && item.path) {
                        router.push(item.path, { scroll: false });
                        setIsOpen(false);
                      }
                    }}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border ${
                      item.disabled
                        ? "opacity-80 cursor-not-allowed bg-slate-800/50 border-transparent"
                        : active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent shadow-lg"
                        : "hover:bg-slate-700 border-transparent hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        item.disabled
                          ? "bg-slate-800"
                          : active
                          ? "bg-white/20"
                          : "bg-slate-700"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          item.disabled
                            ? "text-slate-600"
                            : active
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-semibold ${
                          item.disabled
                            ? "text-slate-600"
                            : active
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {item.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          item.disabled
                            ? "text-slate-600"
                            : active
                            ? "text-blue-200"
                            : "text-slate-400"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                    {!item.disabled && (
                      <ChevronRight
                        className={`w-5 h-5 ${
                          active ? "text-white" : "text-slate-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Info */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">Current Location:</p>
              <p className="text-sm text-white font-mono truncate">
                {pathname || "/"}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-center text-slate-500">
                Press{" "}
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
