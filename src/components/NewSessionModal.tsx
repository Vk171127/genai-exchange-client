"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { createSession } from "@/lib/api";
import { useRouter } from "next/navigation";

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: (sessionId: string) => void;
}

export default function NewSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
}: NewSessionModalProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreateSession = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const response = await createSession({ project_name: newProjectName });
      setNewProjectName("");
      onClose();

      // Callback for parent component to refresh session list
      if (onSessionCreated) {
        onSessionCreated(response.session.id);
      }

      // Navigate to new session
      router.push(`/sessions/${response.session.id}`);
    } catch (error) {
      console.error("Create session error:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !creating && newProjectName.trim()) {
      handleCreateSession();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Create New Healthcare Session
            </h3>
            <p className="text-gray-400">
              Start generating test cases for your healthcare application
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
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
              className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={creating}
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to create or Esc to cancel
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
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
  );
}
