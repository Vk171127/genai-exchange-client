"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Sparkles,
  Brain,
  FileText,
} from "lucide-react";
import Sidebar from "./Sidebar";
import FetchContextModal from "./FetchContextModal";
import AnalysisEditor from "./AnalysisEditor";
import TestCaseModal from "./TestCaseModal";
import { useWorkflow } from "@/hooks/useWorkflow";
import { analyzeRequirements } from "@/lib/api";

interface WorkflowChatInterfaceProps {
  sessionId: string;
}

export default function WorkflowChatInterface({
  sessionId,
}: WorkflowChatInterfaceProps) {
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [generatedTestCases, setGeneratedTestCases] = useState<any[]>([]);

  const router = useRouter();

  const {
    currentChatId,
    setCurrentChatId,
    currentStep,
    setCurrentStep,
    messages,
    setMessages,
    userPrompt,
    setUserPrompt,
    agentAnalysis,
    setAgentAnalysis,
    chats,
    chatsLoading,
    fetchContext,
    fetchContextLoading,
    analyzeData,
    analyzeDataLoading,
    sessionDetails,
    sessionDetailsLoading,
  } = useWorkflow(sessionId);

  const handleNewChat = () => setShowFetchModal(true);
  const handleContextFetched = (summary: string, prompt: string) => {
    fetchContext({ prompt });
    setShowFetchModal(false);
  };
  const handleStartAnalysis = () => setCurrentStep("analyze");

  React.useEffect(() => {
    if (sessionDetails && sessionDetails.status === "rag-context_loaded") {
      setCurrentStep("analyze");
    }
  }, [sessionDetails, setCurrentStep]);
  const handleAnalyzeData = () => {
    if (!userPrompt.trim() || !currentChatId) return;
    try {
      analyzeData({ chatId: currentChatId, text: userPrompt });
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };
  const handleAnalysisEdited = (editedAnalysis: string) => {
    setAgentAnalysis(editedAnalysis);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.role === "agent" && msg.id.startsWith("analysis-")
          ? { ...msg, text: editedAnalysis }
          : msg
      )
    );
    setCurrentStep("generate-testcases");
  };
  const handleGenerateTestCases = () => setShowTestCaseModal(true);
  const handleTestCasesGenerated = (testCases: any[]) => {
    const testCaseMessage = {
      id: `testcases-${Date.now()}`,
      role: "system" as const,
      text: `Generated ${testCases.length} comprehensive healthcare test cases. Ready for implementation.`,
      created_at: new Date().toISOString(),
      chat_id: currentChatId!,
    };
    setMessages((prev) => [...prev, testCaseMessage]);
    setGeneratedTestCases(testCases);
    setCurrentStep("complete");
  };

  const getWorkflowSteps = () => [
    {
      id: "no-chat",
      title: "Fetch",
      icon: FileText,
      color:
        currentStep === "no-chat"
          ? "from-blue-500 to-cyan-500"
          : "from-gray-500 to-gray-600",
    },
    {
      id: "context-fetched",
      title: "Analyze",
      icon: Brain,
      color: ["context-fetched", "analyze"].includes(currentStep)
        ? "from-purple-500 to-pink-500"
        : "from-gray-500 to-gray-600",
    },
    {
      id: "edit-analysis",
      title: "Review",
      icon: Target,
      color:
        currentStep === "edit-analysis"
          ? "from-amber-500 to-orange-500"
          : "from-gray-500 to-gray-600",
    },
    {
      id: "generate-testcases",
      title: "Generate",
      icon: Sparkles,
      color: ["generate-testcases", "complete"].includes(currentStep)
        ? "from-green-500 to-emerald-500"
        : "from-gray-500 to-gray-600",
    },
  ];

  const isStepComplete = (stepId: string) => {
    const stepOrder = [
      "no-chat",
      "context-fetched",
      "analyze",
      "edit-analysis",
      "generate-testcases",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    const isRagContextLoaded =
      sessionDetails && sessionDetails.status === "rag-context_loaded";

    if (isRagContextLoaded && stepId === "no-chat") {
      return true;
    }

    return (
      stepIndex < currentIndex ||
      (stepId === "generate-testcases" && currentStep === "complete")
    );
  };

  const isStepActive = (stepId: string) => {
    return (
      currentStep === stepId ||
      (stepId === "context-fetched" && currentStep === "analyze") ||
      (stepId === "generate-testcases" && currentStep === "complete")
    );
  };

  if (chatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-white font-medium">
            Loading Healthcare Session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Sidebar
          sessionId={sessionId}
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={handleNewChat}
          sessionDetails={sessionDetails}
        />

        <div className="flex-1 flex flex-col">
          {/* Compact Header with Progress */}
          <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/40 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </button>
                <div className="w-px h-4 bg-slate-600" />
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Healthcare Test Generation
                  </h1>
                  <p className="text-xs text-slate-400">
                    Session: {sessionId.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-6">
                {getWorkflowSteps().map((step, index) => {
                  const StepIcon = step.icon;
                  const isComplete = isStepComplete(step.id);
                  const isActive = isStepActive(step.id);

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`relative w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-br ${step.color} scale-105`
                              : isComplete
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : "bg-slate-700 hover:bg-slate-600"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <StepIcon
                              className={`w-4 h-4 ${
                                isActive ? "text-white" : "text-slate-300"
                              }`}
                            />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <div
                            className={`text-xs font-medium ${
                              isActive
                                ? "text-white"
                                : isComplete
                                ? "text-green-300"
                                : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </div>
                        </div>
                      </div>

                      {index < getWorkflowSteps().length - 1 && (
                        <div
                          className={`w-12 h-0.5 mx-3 transition-colors ${
                            isComplete ? "bg-green-500" : "bg-slate-600"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {currentStep === "no-chat" ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Welcome to Healthcare Test Generation
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    Start by clicking "New Analysis" to fetch healthcare context
                    and begin your AI-powered workflow.
                  </p>
                </div>
              </div>
            ) : currentStep === "context-fetched" ? (
              <div className="flex-1 flex flex-col p-6">
                <div className="max-w-3xl mx-auto flex-1 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 bg-slate-800/50 rounded-lg text-slate-200 text-sm"
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button
                    onClick={handleStartAnalysis}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
                  >
                    Start Healthcare Analysis
                  </button>
                </div>
              </div>
            ) : currentStep === "analyze" ? (
              <div className="p-6 max-w-3xl mx-auto">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., Analyze patient registration workflow for HIPAA compliance, edge cases, and security..."
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white min-h-[120px]"
                />
                <button
                  onClick={handleAnalyzeData}
                  disabled={analyzeDataLoading || !userPrompt.trim()}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg disabled:opacity-50"
                >
                  {analyzeDataLoading ? "Analyzing..." : "Analyze Data"}
                </button>
              </div>
            ) : currentStep === "edit-analysis" ? (
              <div className="p-6 max-w-3xl mx-auto">
                <AnalysisEditor
                  analysis={agentAnalysis}
                  onSave={handleAnalysisEdited}
                  sessionId={sessionId}
                />
              </div>
            ) : currentStep === "generate-testcases" ? (
              <div className="p-6 text-center">
                <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white text-lg mb-2">Analysis Complete</h3>
                <p className="text-slate-400 mb-4">
                  Generate test cases from the refined analysis
                </p>
                <textarea
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  placeholder="e.g., Refine analysis for edge cases and security vulnerabilities..."
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white min-h-[120px] mb-4"
                />
                <button
                  onClick={handleGenerateTestCases}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
                >
                  Generate Test Cases
                </button>
              </div>
            ) : currentStep === "complete" ? (
              <div className="p-6">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-green-300 text-lg mb-2">
                  Workflow Complete!
                </h3>
                <p className="text-slate-400 mb-4">
                  Healthcare test cases are ready for implementation.
                </p>
                {generatedTestCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 rounded-lg p-4 mb-4"
                  >
                    <h4 className="text-white font-semibold">
                      {testCase.name}
                    </h4>
                    <p className="text-slate-400">{testCase.description}</p>
                    <ul className="list-disc list-inside text-slate-300">
                      {testCase.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                    <p className="text-green-300">
                      Expected Result: {testCase.expectedResults}
                    </p>
                    <p className="text-yellow-300">Priority: {testCase.priority}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <FetchContextModal
        isOpen={showFetchModal}
        onClose={() => setShowFetchModal(false)}
        onContextFetched={handleContextFetched}
        sessionId={sessionId}
        loading={fetchContextLoading}
      />

      <TestCaseModal
        isOpen={showTestCaseModal}
        onClose={() => setShowTestCaseModal(false)}
        onTestCasesGenerated={handleTestCasesGenerated}
        analysis={agentAnalysis}
        sessionId={sessionId}
      />
    </>
  );
}
