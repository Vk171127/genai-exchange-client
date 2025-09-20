// FILE 2: src/components/TestCaseModal.tsx (ENHANCED UI)
"use client";
import React, { useState } from "react";
import {
  X,
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
} from "lucide-react";
import { generateTestCases } from "@/lib/api";
import { useSearchParams } from "next/navigation";

interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  type:
    | "Functional"
    | "Security"
    | "Integration"
    | "Performance"
    | "Compliance";
  steps: string[];
  expected: string;
}

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCasesGenerated: (testCases: TestCase[]) => void;
  analysis: string;
}

export default function TestCaseModal({
  isOpen,
  onClose,
  onTestCasesGenerated,
  analysis,
}: TestCaseModalProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);

  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const handleGenerate = async () => {
    setGenerating(true);

    try {
      // TODO: need to get prompt from the chat messages
      const prompt =
        "Generate comprehensive test cases for the refined analysis.";
      const response = await generateTestCases(sessionId!, prompt);

      setGeneratedTestCases(response.testCases);
      onTestCasesGenerated(response.testCases);
    } catch (error) {
      console.error("Test case generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "Critical":
        return {
          color: "from-red-500 to-red-600",
          bg: "bg-red-500/10",
          text: "text-red-300",
          border: "border-red-500/30",
        };
      case "High":
        return {
          color: "from-orange-500 to-orange-600",
          bg: "bg-orange-500/10",
          text: "text-orange-300",
          border: "border-orange-500/30",
        };
      case "Medium":
        return {
          color: "from-yellow-500 to-yellow-600",
          bg: "bg-yellow-500/10",
          text: "text-yellow-300",
          border: "border-yellow-500/30",
        };
      default:
        return {
          color: "from-blue-500 to-blue-600",
          bg: "bg-blue-500/10",
          text: "text-blue-300",
          border: "border-blue-500/30",
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Security":
        return Shield;
      case "Compliance":
        return CheckCircle2;
      case "Integration":
        return AlertTriangle;
      default:
        return Sparkles;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Healthcare Test Case Generator
              </h3>
              <p className="text-sm text-slate-400">
                AI-powered test case generation from analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto">
          {generatedTestCases.length === 0 ? (
            <div className="p-8">
              <div className="text-center py-12">
                {!generating ? (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">
                      Ready to Generate Test Cases
                    </h4>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                      Our AI will analyze your healthcare requirements and
                      generate comprehensive test cases covering functionality,
                      security, and compliance.
                    </p>
                    <button
                      onClick={handleGenerate}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg"
                    >
                      Generate Healthcare Test Cases
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative inline-block mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                        <Sparkles className="w-12 h-12 text-white animate-spin" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">
                      Generating Test Cases
                    </h4>
                    <p className="text-slate-400 mb-8">
                      AI is analyzing healthcare requirements and creating
                      comprehensive test scenarios...
                    </p>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Summary header */}
              <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/30">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    Generated Test Cases
                  </h4>
                  <p className="text-slate-400">
                    Found {generatedTestCases.length} comprehensive healthcare
                    test scenarios
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy All
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Test cases grid */}
              <div className="space-y-4 mb-6">
                {generatedTestCases.map((testCase) => {
                  const priorityConfig = getPriorityConfig(testCase.priority);
                  const TypeIcon = getTypeIcon(testCase.type);

                  return (
                    <div
                      key={testCase.id}
                      className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${priorityConfig.color} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <TypeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-white text-lg mb-2 group-hover:text-blue-300 transition-colors">
                              {testCase.id}: {testCase.title}
                            </h5>
                            <p className="text-slate-300 mb-3 leading-relaxed">
                              {testCase.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg ${priorityConfig.bg} ${priorityConfig.text} border ${priorityConfig.border}`}
                          >
                            {testCase.priority}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-600/30 text-slate-300 border border-slate-600/30">
                            {testCase.type}
                          </span>
                        </div>
                      </div>

                      {/* Test steps */}
                      <div className="space-y-3">
                        <h6 className="font-semibold text-slate-200 text-sm">
                          Test Steps:
                        </h6>
                        <ol className="space-y-2">
                          {testCase.steps.map((step, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm text-slate-300"
                            >
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                            <span className="text-sm font-semibold text-green-300">
                              Expected Result:
                            </span>
                          </div>
                          <p className="text-sm text-green-200">
                            {testCase.expected}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedTestCases.length > 0 && (
          <div className="relative z-10 p-6 border-t border-slate-700/50">
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTestCasesGenerated(generatedTestCases);
                  onClose();
                  setGeneratedTestCases([]);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 font-semibold"
              >
                Accept & Save Test Cases
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
