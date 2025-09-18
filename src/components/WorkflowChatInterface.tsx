"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import FetchContextModal from "./FetchContextModal";
import AnalysisEditor from "./AnalysisEditor";
import TestCaseModal from "./TestCaseModal";
import type { Message, Chat } from "@/lib/types";

type WorkflowStep =
  | "no-chat"
  | "context-fetched"
  | "analyze"
  | "edit-analysis"
  | "generate-testcases"
  | "complete";

interface WorkflowChatInterfaceProps {
  sessionId: string;
}

export default function WorkflowChatInterface({
  sessionId,
}: WorkflowChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("no-chat");
  const [userPrompt, setUserPrompt] = useState("");
  const [agentAnalysis, setAgentAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);

  const router = useRouter();

  const handleNewChat = () => {
    // Immediately show fetch context modal when "New Chat" is clicked
    setShowFetchModal(true);
  };

  const handleContextFetched = (summary: string) => {
    // Create new chat
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "Healthcare Analysis",
      session_id: sessionId,
      last_message: "Context fetched",
      updated_at: new Date().toISOString(),
    };

    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChatId);

    // Add context message
    const contextMessage: Message = {
      id: `ctx-${Date.now()}`,
      role: "system",
      text: `Context Retrieved: ${summary}`,
      created_at: new Date().toISOString(),
      chat_id: newChatId,
    };

    setMessages([contextMessage]);
    setCurrentStep("context-fetched"); // Show "Start Analysis" button
  };

  const handleStartAnalysis = () => {
    setCurrentStep("analyze");
  };

  const handleAnalyzeData = async () => {
    if (!userPrompt.trim() || !currentChatId) return;

    setLoading(true);

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: userPrompt,
      created_at: new Date().toISOString(),
      chat_id: currentChatId,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // TODO: need to attach api here - call analysis API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const analysisText = `Analysis of "${userPrompt}":\n\n1. Healthcare Compliance Requirements:\n   - HIPAA privacy and security compliance\n   - Patient data encryption standards\n   - Audit logging requirements\n\n2. Test Case Categories:\n   - Authentication and authorization tests\n   - Data validation and sanitization\n   - Error handling and edge cases\n   - Integration with medical devices\n\n3. Risk Assessment:\n   - High: Patient data exposure\n   - Medium: System downtime impact\n   - Low: UI/UX inconsistencies`;

      setAgentAnalysis(analysisText);

      const agentMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: "agent",
        text: analysisText,
        created_at: new Date().toISOString(),
        chat_id: currentChatId,
      };

      setMessages((prev) => [...prev, agentMessage]);
      setCurrentStep("edit-analysis");
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
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

  const handleGenerateTestCases = () => {
    setShowTestCaseModal(true);
  };

  const handleTestCasesGenerated = (testCases: any[]) => {
    const testCaseMessage: Message = {
      id: `testcases-${Date.now()}`,
      role: "system",
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
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:text-blue-700 text-sm"
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
              {/* Show context message */}
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

              {/* Start Analysis Button */}
              <div className="border-t bg-white p-4">
                <div className="max-w-4xl mx-auto text-center">
                  <p className="text-gray-600 mb-4">
                    Context has been successfully retrieved. Ready to start
                    healthcare analysis.
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start New Healthcare Analysis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
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

              {/* Action Area */}
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
                        disabled={loading || !userPrompt.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? "Analyzing..." : "Analyze Data"}
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
                        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

      {/* Modals */}
      <FetchContextModal
        isOpen={showFetchModal}
        onClose={() => setShowFetchModal(false)}
        onContextFetched={handleContextFetched}
        sessionId={sessionId}
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
