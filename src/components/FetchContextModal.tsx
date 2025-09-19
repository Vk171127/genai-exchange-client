// FILE 1: src/components/FetchContextModal.tsx (FIXED - pass both parameters)
"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
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

  const handleFetch = async () => {
    if (!prompt.trim()) return;

    try {
      // TODO: need to attach api here
      const response = await fetchRAGContext(sessionId, prompt);
      onContextFetched(response.summary, prompt); // Pass both parameters
      onClose();
      setPrompt("");
    } catch (error) {
      console.error("Fetch context error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFetch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Fetch Healthcare Context
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Healthcare Context Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'Patient data validation requirements', 'HIPAA compliance for EMR systems', 'Medical device integration specs'..."
            className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleFetch}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch Context"}
          </button>
        </div>
      </div>
    </div>
  );
}
