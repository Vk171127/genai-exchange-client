// app/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Activity,
  Clock,
  CheckCircle,
  BarChart3,
  Zap,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/types";
import { getActiveSessions } from "@/lib/api";
import NewSessionModal from "@/components/NewSessionModal";
import { SessionCard } from "@/components/SessionCard";
import Sitemap from "@/components/SiteMap";
import { useAppTour } from "@/hooks/useAppTour";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { startDashboardTour } = useAppTour();

  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-start tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("dashboard-tour-completed");
    if (!hasSeenTour && !loading) {
      const timer = setTimeout(() => {
        startDashboardTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const loadSessions = async () => {
    try {
      const response = await getActiveSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error("Load sessions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = (sessionId: string) => {
    loadSessions();
  };

  const filteredSessions = sessions.filter((session) =>
    session.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const inProgress = sessions.filter(
      (s) => s.status === "in_progress" || s.status === "rag_context_loaded"
    ).length;
    const analyzing = sessions.filter(
      (s) => s.status === "requirements_analyzed"
    ).length;
    const generated = sessions.filter(
      (s) => s.status === "test_cases_generated"
    ).length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    return {
      inProgress,
      analyzing,
      generated,
      completed,
      total: sessions.length,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                HT
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Healthcare TestGen
                </h1>
                <p className="text-blue-300 text-xs">
                  AI-Powered Test Generation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* ✅ Tour Button */}
              <button
                onClick={startDashboardTour}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Tour</span>
              </button>

              {/* ✅ New Session Button - Tour Target */}
              <button
                onClick={() => setShowNewModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Healthcare Sessions
          </h1>
          <p className="text-gray-300 text-lg">
            Manage automated test case generation for healthcare applications
          </p>
        </div>

        {/* ✅ Stats Cards - Tour Target */}
        <div className="stats-cards-row grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatsCard
            icon={Activity}
            title="Total Sessions"
            value={stats.total}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon={Zap}
            title="In Progress"
            value={stats.inProgress}
            color="from-purple-500 to-indigo-500"
          />
          <StatsCard
            icon={BarChart3}
            title="Analyzed"
            value={stats.analyzing}
            color="from-amber-500 to-orange-700"
          />
          <StatsCard
            icon={Sparkles}
            title="Generated"
            value={stats.generated}
            color="from-teal-500 to-cyan-500"
          />
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completed}
            color="from-lime-500 to-green-500"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* ✅ Search Bar - Tour Target */}
          <div className="search-bar relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search healthcare applications..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* ✅ Sessions Grid - Tour Target */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-300 text-lg">
              Loading healthcare sessions...
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState onCreateSession={() => setShowNewModal(true)} />
        ) : (
          <div className="sessions-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSessionCreated={handleSessionCreated}
      />
      <Sitemap />
    </div>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: any;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreateSession }: { onCreateSession: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Plus className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        No Healthcare Sessions Yet
      </h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Get started by creating your first session to generate test cases for
        your healthcare application
      </p>
      <button
        onClick={onCreateSession}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Create Your First Session
      </button>
    </div>
  );
}
