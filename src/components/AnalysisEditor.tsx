// FILE 3: src/components/AnalysisEditor.tsx (ENHANCED UI)
"use client";
import { editRequirements } from "@/lib/api";
import { AlertCircle, CheckCircle, Edit3, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisEditorProps {
  analysis: string;
  requirements: string;
  onSave: (editedAnalysis: string) => void;
  sessionId: string;
}

export default function AnalysisEditor({
  analysis,
  requirements,
  onSave,
  sessionId,
}: AnalysisEditorProps) {
  const [editedAnalysis, setEditedAnalysis] = useState(analysis);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedAnalysis(analysis);
  }, [analysis]);

  const handleChange = (value: string) => {
    setEditedAnalysis(value);
    setHasChanges(value !== analysis && value !== requirements);
  };

  const handleSave = async () => {
    try {
      await editRequirements(sessionId, [editedAnalysis]);
      onSave(editedAnalysis);
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating requirements:", error);
      // Handle error appropriately (e.g., display an error message)
    }
  };

  const handleReset = () => {
    setEditedAnalysis(analysis);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Edit Healthcare Analysis</h3>
            <p className="text-sm text-slate-400">
              Review and modify the AI-generated analysis
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-300" />
            <span className="text-sm text-amber-300">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <textarea
          value={`${requirements}\n\n${editedAnalysis}`}
          readOnly
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white font-mono text-sm leading-relaxed transition-all duration-200 resize-none"
          placeholder="Enter your healthcare analysis here..."
        />

        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Healthcare analysis content</span>
          <span>{editedAnalysis.length} characters</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-6 py-3 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Analysis
        </button>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Analysis Tips</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Focus on HIPAA compliance requirements</li>
              <li>• Include patient data security considerations</li>
              <li>• Identify potential edge cases and error scenarios</li>
              <li>• Consider integration points with medical devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
