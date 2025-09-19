"use client";
import React, { useRef, useEffect } from "react";
import type { Message } from "@/lib/types";

interface ChatWindowProps {
  messages: Message[];
  onGenerateTestCases?: () => void;
}

export default function ChatWindow({
  messages,
  onGenerateTestCases,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Avatar rendering based on role
  const getAvatar = (role: string) => {
    if (role === "user")
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-bold text-white shadow-md border-2 border-white">
          U
        </div>
      );
    if (role === "agent")
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center font-bold text-white shadow-md border-2 border-white">
          AI
        </div>
      );
    // system
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-yellow-900 shadow-md border-2 border-white">
        S
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2 font-semibold tracking-wide">
                No messages yet
              </p>
              <p className="text-sm">
                Start by fetching context or sending a message
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.role === "user"
                  ? "justify-end flex-row-reverse"
                  : "justify-start"
              }`}
            >
              {getAvatar(message.role)}
              <div
                className={`message-${message.role} glass-morphism rounded-2xl p-4 shadow-md animate-popIn max-w-[70%] transition-all duration-300`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold tracking-wide ${
                      message.role === "user"
                        ? "bg-blue-100 text-blue-800"
                        : message.role === "agent"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {message.role.charAt(0).toUpperCase() +
                      message.role.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Generate Test Cases Button - only show if we have agent messages */}
        {messages.some((m) => m.role === "agent") && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onGenerateTestCases}
              className="px-4 py-2 bg-green-600 text-white rounded-md btn-glow hover:bg-green-700 transition-colors shadow-lg cursor-pointer"
            >
              Generate Test Cases
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
