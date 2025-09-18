"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import PromptInput from "./PromptInput";
import FetchContextModal from "./FetchContextModal";
import type { Message, Chat } from "@/lib/types";
import { sendMessage, getChats, getMessages } from "@/lib/api";

interface SessionChatInterfaceProps {
  sessionId: string;
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

  const handleGenerateTestCases = () => {
    // TODO: need to attach api here - generate test cases
    console.log(
      "Generate test cases for session:",
      sessionId,
      "chat:",
      currentChatId
    );
  };

  return (
    <>
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
      </div>

      {/* Fetch Context Modal */}
      <FetchContextModal
        isOpen={showFetchModal}
        onClose={() => setShowFetchModal(false)}
        onContextFetched={handleContextFetched}
        sessionId={sessionId}
      />
    </>
  );
}
