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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">
                Start by fetching context or sending a message
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
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
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {message.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <div className="text-gray-900 whitespace-pre-wrap">
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
