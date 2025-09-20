"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import PromptInput from "./PromptInput";
import FetchContextModal from "./FetchContextModal";
import type { Message, Chat } from "@/lib/types";
import {
  sendMessage,
  getChats,
  getMessages,
  analyzeRequirements,
} from "@/lib/api";
import { useWorkflow } from "@/hooks/useWorkflow";
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

interface SessionChatInterfaceProps {
  sessionId: string;
}

interface FetchContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContextFetched: (summary: string) => void;
    sessionId: string;
    loading?: boolean;
}

export default function SessionChatInterface({
  sessionId,
}: SessionChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatParam = searchParams?.get("chat");

  const {
    currentStep,
    setCurrentStep,
    sessionDetails,
  } = useWorkflow(sessionId);

  useEffect(() => {
    if (sessionDetails && sessionDetails.status === "rag-context_loaded") {
      setCurrentStep("analyze");
    }
  }, [sessionDetails, setCurrentStep]);

  useEffect(() => {
    loadChats();
  }, [sessionId]);

  useEffect(() => {
    if (chatParam && chatParam !== currentChatId) {
      setCurrentChatId(chatParam);
      loadMessages(chatParam);
    }
  }, [chatParam, currentChatId]);

  const loadChats = async () => {
    try {
      // TODO: need to attach api here
      const response = await getChats(sessionId);
      setChats(response.chats);

      // If no chat selected but chats exist, select first one
      if (!chatParam && response.chats.length > 0) {
        const firstChat = response.chats[0];
        router.replace(`/sessions/${sessionId}?chat=${firstChat.id}`);
      }
    } catch (error) {
      console.error("Load chats error:", error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // TODO: need to attach api here
      const response = await getMessages(chatId);
      setMessages(response.messages);
    } catch (error) {
      console.error("Load messages error:", error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/sessions/${sessionId}?chat=${chatId}`);
  };

  const handleNewChat = () => {
    setShowFetchModal(true);
  };

  const handleContextFetched = (summary: string) => {
    // Create a new chat and add context message
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "New Healthcare Analysis",
      session_id: sessionId,
      last_message: "Context fetched",
      updated_at: new Date().toISOString(),
    };

    // Add to chats list
    setChats((prev) => [newChat, ...prev]);

    // Create context message
    const contextMessage: Message = {
      id: `ctx-${Date.now()}`,
      role: "system",
      text: summary,
      created_at: new Date().toISOString(),
      chat_id: newChatId,
    };

    // Navigate to new chat
    router.push(`/sessions/${sessionId}?chat=${newChatId}`);
    setMessages([contextMessage]);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentChatId) return;

    setLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      created_at: new Date().toISOString(),
      chat_id: currentChatId,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // TODO: need to attach api here
      const response = await sendMessage(currentChatId, text);

      // Add agent reply
      if (response.agent_reply) {
        setMessages((prev) => [...prev, response.agent_reply!]);
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestCases = async () => {
    if (!sessionId || !currentChatId) {
      console.error("Session ID or Chat ID is missing");
      return;
    }

    setLoading(true);

    try {
      // TODO: need to get prompt from the chat messages
      const prompt =
        "Thoroughly analyse the requirements and give the detailed analysis for test case generation.";
      const response = await analyzeRequirements(sessionId, prompt);

      // Handle the analysis response
      console.log("Requirements analysis response:", response);

      // Add the analysis to the chat messages
      const analysisMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: "agent",
        text: response.analysis,
        created_at: new Date().toISOString(),
        chat_id: currentChatId,
      };
      setMessages((prev) => [...prev, analysisMessage]);
    } catch (error) {
      console.error("Error analyzing requirements:", error);
    } finally {
      setLoading(false);
    }
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

    const isRagContextLoaded =
      sessionDetails && sessionDetails.status === "rag-context_loaded";

    if (isRagContextLoaded && stepId === "no-chat") {
      return true;
    }

    return false;
  };

  const isStepActive = (stepId: string) => {
    return (
      currentStep === stepId ||
      (stepId === "context-fetched" && currentStep === "analyze") ||
      (stepId === "generate-testcases" && currentStep === "complete")
    );
  };

  return (
    <div>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          sessionId={sessionId}
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Healthcare Test Case Generation
                </h1>
                <p className="text-sm text-gray-500">
                  Session: {sessionId} | Chat:{" "}
                  {currentChatId || "Select a chat"}
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
          </div>

          {/* Chat Area */}
          {currentChatId ? (
            <>
              <ChatWindow
                messages={messages}
                onGenerateTestCases={handleGenerateTestCases}
              />
              <PromptInput onSend={handleSendMessage} disabled={loading} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No chat selected</p>
                <p>Select a chat from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
</div>)}
