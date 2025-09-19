// FILE: src/components/FetchContextModal.tsx
"use client";
import React, { useState } from "react";
import {
  X,
  Search,
  Loader2,
  FileText,
  Shield,
  Database,
  Sparkles,
} from "lucide-react";
import { fetchRAGContext } from "@/lib/api";

interface FetchContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContextFetched: (summary: string, prompt: string) => void;
  sessionId: string;
  loading?: boolean;
}

export default function FetchContextModal({
  isOpen,
  onClose,
  onContextFetched,
  sessionId,
  loading = false,
}: FetchContextModalProps) {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<"input" | "fetching" | "complete">("input");

  const handleFetch = async () => {
    if (!prompt.trim()) return;

    setStep("fetching");
    try {
      const response = await fetchRAGContext(sessionId, prompt);
      setStep("complete");

      setTimeout(() => {
        onContextFetched(response.summary, prompt);
        onClose();
        setPrompt("");
        setStep("input");
      }, 1500);
    } catch (error) {
      console.error("Fetch context error:", error);
      setStep("input");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 
        rounded-3xl w-full max-w-2xl shadow-2xl transform transition-all duration-300 scale-100 
        max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
              {step === "fetching" && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Fetch Healthcare Context
              </h3>
              <p className="text-sm text-slate-400">
                AI-powered context retrieval system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            disabled={step === "fetching"}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 p-6 overflow-y-auto flex-1">
          {step === "input" && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
                  <Sparkles className="w-4 h-4" />
                  Healthcare Context Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Patient registration workflow requirements and HIPAA compliance guidelines for EMR system'..."
                  className="w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-slate-500">
                    Describe your healthcare application context
                  </span>
                  <span className="text-xs text-slate-500">
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  Quick Healthcare Contexts
                </div>
                <div className="grid gap-3">
                  {[
                    {
                      icon: Shield,
                      text: "HIPAA compliance and patient privacy requirements",
                      color: "from-green-500 to-emerald-500",
                    },
                    {
                      icon: FileText,
                      text: "Electronic health record workflow specifications",
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      icon: Database,
                      text: "Medical device integration protocols",
                      color: "from-purple-500 to-pink-500",
                    },
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(suggestion.text)}
                      className="group flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 rounded-xl transition-all duration-200 text-left"
                    >
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${suggestion.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <suggestion.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-200 group-hover:text-white transition-colors flex-1">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFetch}
                  disabled={loading || !prompt.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 font-semibold"
                >
                  Fetch Context
                </button>
              </div>
            </div>
          )}

          {step === "fetching" && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Fetching Healthcare Context
              </h4>
              <p className="text-slate-400">
                AI is analyzing and retrieving relevant context...
              </p>
              <div className="flex justify-center gap-1 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 bg-blue-500 rounded-full animate-pulse`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Context Retrieved Successfully!
              </h4>
              <p className="text-slate-400">
                Opening healthcare analysis chat...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
