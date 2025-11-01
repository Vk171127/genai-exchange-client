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
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/types";
import { getActiveSessions } from "@/lib/api";
import NewSessionModal from "@/components/NewSessionModal";
import { SessionCard } from "@/components/SessionCard";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

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
    // Refresh session list after creating new session
    loadSessions();
  };

  const filteredSessions = sessions.filter((session) =>
    session.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const active = sessions.filter((s) => s.status === "active").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const draft = sessions.filter((s) => s.status === "draft").length;
    return { active, completed, draft, total: sessions.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                HT
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Healthcare TestGen
                </h1>
                <p className="text-blue-300 text-sm">Dashboard</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="text-blue-300 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Healthcare Sessions
            </h1>
            <p className="text-gray-300 text-lg">
              Manage automated test case generation for healthcare applications
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Session
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Activity}
            title="Total Sessions"
            value={stats.total}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon={Zap}
            title="Active"
            value={stats.active}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completed}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            icon={Clock}
            title="Draft"
            value={stats.draft}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
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

        {/* Sessions Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
