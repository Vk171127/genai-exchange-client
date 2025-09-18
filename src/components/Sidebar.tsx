"use client";
import React from "react";
import { Plus, ArrowLeft } from "lucide-react";
import type { Chat } from "@/lib/types";

interface SidebarProps {
  sessionId: string;
  chats?: Chat[];
  currentChatId?: string | null;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
}

export default function Sidebar({
  sessionId,
  chats = [],
  currentChatId,
  onChatSelect,
  onNewChat,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Healthcare TestGen</h2>
        <p className="text-sm text-gray-500">Session: {sessionId}</p>
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
            Chats ({chats.length})
          </h3>
        </div>

        <div className="space-y-1 px-2">
          {chats.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              No chats yet. Click "New Chat" to start.
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect?.(chat.id)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  currentChatId === chat.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-gray-900 text-sm truncate">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">
                  {chat.last_message}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(chat.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        // TODO: need to attach api here
      </div>
    </aside>
  );
}
