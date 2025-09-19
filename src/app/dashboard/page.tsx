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
import { getUserSessions, createSession } from "@/lib/api";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await getUserSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error("Load sessions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const response = await createSession({ project_name: newProjectName });
      setSessions((prev) => [response.session, ...prev]);
      setNewProjectName("");
      setShowNewModal(false);
      router.push(`/sessions/${response.session.id}`);
    } catch (error) {
      console.error("Create session error:", error);
    } finally {
      setCreating(false);
    }
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

        {/* New Session Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">
                Create New Healthcare Session
              </h3>
              <p className="text-gray-400 mb-6">
                Start generating test cases for your healthcare application
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Healthcare Application Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g., EMR Patient Portal, HIPAA Compliance Module"
                    className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 px-4 py-3 text-gray-300 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    disabled={creating || !newProjectName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Session"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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

function SessionCard({ session }: { session: Session }) {
  const router = useRouter();

  const getStatusConfig = (status: Session["status"]) => {
    switch (status) {
      case "active":
        return {
          color: "from-green-500 to-emerald-500",
          textColor: "text-green-300",
          bgColor: "bg-green-500/10",
          icon: Activity,
        };
      case "completed":
        return {
          color: "from-blue-500 to-cyan-500",
          textColor: "text-blue-300",
          bgColor: "bg-blue-500/10",
          icon: CheckCircle,
        };
      case "draft":
        return {
          color: "from-orange-500 to-red-500",
          textColor: "text-orange-300",
          bgColor: "bg-orange-500/10",
          icon: Clock,
        };
      default:
        return {
          color: "from-gray-500 to-gray-600",
          textColor: "text-gray-300",
          bgColor: "bg-gray-500/10",
          icon: Activity,
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
            {session.project_name}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 ${statusConfig.bgColor} rounded-lg`}
          >
            <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
            <span
              className={`text-sm font-medium ${statusConfig.textColor} capitalize`}
            >
              {session.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          Created{" "}
          {new Date(session.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">0 tests</span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/sessions/${session.id}`)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 group-hover:scale-105"
      >
        Open Session
      </button>
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
