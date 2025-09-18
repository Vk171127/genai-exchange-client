"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import SessionCard from "@/components/SessionCard";
import type { Session } from "@/lib/types";
import { getUserSessions, createSession } from "@/lib/api";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // TODO: need to attach api here
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
      // TODO: need to attach api here
      const response = await createSession({ project_name: newProjectName });
      setSessions((prev) => [response.session, ...prev]);
      setNewProjectName("");
      setShowNewModal(false);
    } catch (error) {
      console.error("Create session error:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              TestGen Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your test case generation sessions
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            New Session
          </button>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No sessions yet</p>
              <p>Click "New Session" to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        {/* New Session Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Session
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., E-commerce App, User Management System"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={creating || !newProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
