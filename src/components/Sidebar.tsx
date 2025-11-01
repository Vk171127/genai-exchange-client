"use client";
import React, { useState, useEffect } from "react";
import { Plus, Menu, X, MessageSquare, Settings } from "lucide-react";
import type { Session } from "@/lib/types";
import { getActiveSessions } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import NewSessionModal from "@/components/NewSessionModal";
import Link from "next/link";

interface SidebarProps {
  sessionId: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export default function Sidebar({ sessionId, isOpen, onToggle }: SidebarProps) {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  // ✅ Refresh sessions when sessionId changes (status updated)
  useEffect(() => {
    fetchActiveSessions();
  }, [sessionId]);

  // ✅ Poll for updates every 10 seconds to catch status changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const { sessions } = await getActiveSessions();

      const sortedSessions = sessions.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      });

      setActiveSessions(sortedSessions);
    } catch (error) {
      console.error("Failed to fetch active sessions:", error);
    }
  };

  const handleSessionCreated = () => {
    fetchActiveSessions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
      return date.toLocaleDateString("en-IN", { weekday: "short" });

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // ✅ Get status display label
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      in_progress: "In Progress",
      rag_context_loaded: "Context Loaded",
      requirements_analyzed: "Analyzed",
      test_cases_generated: "Tests Generated",
      completed: "Completed",
    };
    return statusMap[status] || status;
  };

  return (
    <>
      {/* Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-all duration-200"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar - Fixed position */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700/40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">HT</span>
            </div>
            <h2 className="font-bold text-white text-base">
              Healthcare TestGen
            </h2>
          </div>

          <button
            onClick={() => onToggle(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            onClick={() => setShowNewSessionModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {/* Sessions Header */}
            <div className="px-4 py-2 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sessions
              </h3>
            </div>

            {/* Sessions List */}
            <div className="px-2 pb-3">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-500">No sessions yet</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Create your first session to get started
                  </p>
                </div>
              ) : (
                activeSessions.map((session) => {
                  const isCurrentSession = session.id === sessionId;

                  return (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      scroll={false}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 mb-1 group ${
                        isCurrentSession
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
                          : "hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <h4
                          className={`font-medium text-sm truncate mb-0.5 ${
                            isCurrentSession
                              ? "text-white"
                              : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {session.project_name}
                        </h4>
                        <p
                          className={`text-xs truncate ${
                            isCurrentSession
                              ? "text-blue-300"
                              : "text-slate-500 group-hover:text-slate-400"
                          }`}
                        >
                          {getStatusLabel(session.status)}
                        </p>
                      </div>

                      <span
                        className={`text-xs flex-shrink-0 ${
                          isCurrentSession
                            ? "text-blue-400"
                            : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      >
                        {formatDate(session.updated_at || session.created_at)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">System Ready</span>
            </div>
            <button
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop (when sidebar is open on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        onSessionCreated={handleSessionCreated}
      />
    </>
  );
}
