"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import PromptInput from "./PromptInput";
import FetchContextModal from "./FetchContextModal";
import type { Message } from "@/lib/types";
import { sendMessage } from "@/lib/api";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      text: 'Welcome to TestGen! Click "New Chat" to start fetching context, or send a message to begin.',
      created_at: new Date().toISOString(),
      chat_id: "demo-chat",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showFetchModal, setShowFetchModal] = useState(false);

  const handleNewChat = () => {
    setShowFetchModal(true);
  };

  const handleContextFetched = (summary: string) => {
    // Add context summary as a system message
    const contextMessage: Message = {
      id: `ctx-${Date.now()}`,
      role: "system",
      text: summary,
      created_at: new Date().toISOString(),
      chat_id: "demo-chat",
    };

    setMessages((prev) => [...prev, contextMessage]);
  };

  const handleSendMessage = async (text: string) => {
    setLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      created_at: new Date().toISOString(),
      chat_id: "demo-chat",
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // TODO: need to attach api here - this uses mock for now
      const response = await sendMessage("demo-chat", text);

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

  const handleGenerateTestCases = () => {
    // TODO: need to attach api here - generate test cases
    console.log("Generate test cases clicked");
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar sessionId="demo-session" onNewChat={handleNewChat} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Test Case Generation
            </h1>
            <p className="text-sm text-gray-500">
              Chat-driven workflow for analyzing requirements and generating
              test cases
            </p>
          </header>

          {/* Chat Area */}
          <ChatWindow
            messages={messages}
            onGenerateTestCases={handleGenerateTestCases}
          />

          {/* Input */}
          <PromptInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </div>

      {/* Fetch Context Modal */}
      <FetchContextModal
        isOpen={showFetchModal}
        onClose={() => setShowFetchModal(false)}
        onContextFetched={handleContextFetched}
        sessionId="demo-session"
      />
    </>
  );
}
