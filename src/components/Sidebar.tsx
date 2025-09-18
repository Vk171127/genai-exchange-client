"use client";
import React from "react";
import { Plus } from "lucide-react";

interface SidebarProps {
  sessionId?: string;
  onNewChat?: () => void;
}

export default function Sidebar({ sessionId, onNewChat }: SidebarProps) {
  // Mock chats - later this will come from getChats(sessionId)
  const mockChats = [
    {
      id: "chat-1",
      title: "Login validation tests",
      last_message: "Generate edge cases",
    },
    {
      id: "chat-2",
      title: "API error handling",
      last_message: "Analyze error scenarios",
    },
    {
      id: "chat-3",
      title: "User permissions",
      last_message: "Test role-based access",
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">TestGen Chat</h2>
        <p className="text-sm text-gray-500">Session: {sessionId || "Demo"}</p>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => onNewChat?.()}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Chats
          </h3>
        </div>

        <div className="space-y-1 px-2">
          {mockChats.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm truncate">
                {chat.title}
              </div>
              <div className="text-xs text-gray-500 truncate mt-1">
                {chat.last_message}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        // TODO: need to attach api here
      </div>
    </aside>
  );
}
