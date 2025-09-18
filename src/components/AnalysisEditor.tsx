"use client";
import React, { useState } from "react";

interface AnalysisEditorProps {
  analysis: string;
  onSave: (editedAnalysis: string) => void;
}

export default function AnalysisEditor({
  analysis,
  onSave,
}: AnalysisEditorProps) {
  const [editedAnalysis, setEditedAnalysis] = useState(analysis);

  const handleSave = () => {
    onSave(editedAnalysis);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Edit Agent Analysis:
        </label>
        <span className="text-xs text-gray-500">
          Modify the analysis as needed
        </span>
      </div>

      <textarea
        value={editedAnalysis}
        onChange={(e) => setEditedAnalysis(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-md min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-sm"
      />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Analysis
        </button>
        <button
          onClick={() => setEditedAnalysis(analysis)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
