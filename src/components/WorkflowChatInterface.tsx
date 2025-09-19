"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import FetchContextModal from "./FetchContextModal";
import AnalysisEditor from "./AnalysisEditor";
import TestCaseModal from "./TestCaseModal";
import { useWorkflow } from "@/hooks/useWorkflow";

interface WorkflowChatInterfaceProps {
  sessionId: string;
}

export default function WorkflowChatInterface({
  sessionId,
}: WorkflowChatInterfaceProps) {
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);

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
  } = useWorkflow(sessionId);

  const handleNewChat = () => {
    setShowFetchModal(true);
  };

  const handleContextFetched = (summary: string, prompt: string) => {
    fetchContext({ prompt });
    setShowFetchModal(false);
  };

  const handleStartAnalysis = () => {
    setCurrentStep("analyze");
  };

  const handleAnalyzeData = () => {
    if (!userPrompt.trim() || !currentChatId) return;
    analyzeData({ chatId: currentChatId, text: userPrompt });
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

  const handleGenerateTestCases = () => {
    setShowTestCaseModal(true);
  };

  const handleTestCasesGenerated = (testCases: any[]) => {
    const testCaseMessage = {
      id: `testcases-${Date.now()}`,
      role: "system" as const,
      text: `Generated ${testCases.length} test cases successfully. Test cases validated and ready for ALM integration.`,
      created_at: new Date().toISOString(),
      chat_id: currentChatId!,
    };

    setMessages((prev) => [...prev, testCaseMessage]);
    setCurrentStep("complete");
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "no-chat":
        return 'Click "New Chat" to start';
      case "context-fetched":
        return "Context retrieved - ready to start analysis";
      case "analyze":
        return "Enter your analysis prompt";
      case "edit-analysis":
        return "Review and edit agent analysis";
      case "generate-testcases":
        return "Ready to generate test cases";
      case "complete":
        return "Workflow complete";
      default:
        return "";
    }
  };

  if (chatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          sessionId={sessionId}
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={handleNewChat}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Healthcare Test Generation Workflow
                </h1>
                <p className="text-sm text-gray-500">
                  {getStepDescription()} | Session: {sessionId}
                  {fetchContextLoading && " | Fetching context..."}
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            </div>
          </header>

          {/* Main Content */}
          {currentStep === "no-chat" ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Healthcare Test Generation
                </h3>
                <p className="text-gray-600 mb-4">
                  Click "New Chat" in the sidebar to fetch context and begin
                  analysis
                </p>
              </div>
            </div>
          ) : currentStep === "context-fetched" ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex justify-start">
                      <div className="message-system rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                            {message.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-900 whitespace-pre-wrap">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t bg-white p-4">
                <div className="max-w-4xl mx-auto text-center">
                  <p className="text-gray-600 mb-4">
                    Context has been successfully retrieved. Ready to start
                    healthcare analysis.
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    Start New Healthcare Analysis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`message-${message.role} rounded-lg p-4 shadow-sm`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              message.role === "user"
                                ? "bg-blue-100 text-blue-800"
                                : message.role === "agent"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {message.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-900 whitespace-pre-wrap">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t bg-white p-4">
                <div className="max-w-4xl mx-auto">
                  {currentStep === "analyze" && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Enter your healthcare analysis prompt:
                      </label>
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="e.g., Analyze patient registration workflow for HIPAA compliance and edge cases..."
                        className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      />
                      <button
                        onClick={handleAnalyzeData}
                        disabled={analyzeDataLoading || !userPrompt.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                      >
                        {analyzeDataLoading ? "Analyzing..." : "Analyze Data"}
                      </button>
                    </div>
                  )}

                  {currentStep === "edit-analysis" && (
                    <AnalysisEditor
                      analysis={agentAnalysis}
                      onSave={handleAnalysisEdited}
                    />
                  )}

                  {currentStep === "generate-testcases" && (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Analysis complete. Ready to generate test cases.
                      </p>
                      <button
                        onClick={handleGenerateTestCases}
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer"
                      >
                        Generate Test Cases
                      </button>
                    </div>
                  )}

                  {currentStep === "complete" && (
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">
                        Workflow Complete!
                      </p>
                      <p className="text-gray-600 mt-2">
                        Test cases generated and ready for ALM integration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
      />
    </>
  );
}
