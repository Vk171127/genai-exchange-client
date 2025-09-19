"use client";
import React, { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import type { Chat } from "@/lib/types";

interface SidebarProps {
  sessionId: string;
  chats?: Chat[];
  currentChatId?: string | null;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
}

function Sidebar(props: SidebarProps) {
  const {
    sessionId,
    chats = [],
    currentChatId,
    onChatSelect,
    onNewChat,
  } = props;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative glass-morphism border-r border-gray-200 flex flex-col shadow-xl transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-gray-100 transition-transform cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle sidebar"
        style={{ transition: "transform 0.3s" }}
      >
        <ArrowLeft
          className={`w-5 h-5 transition-transform ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Header with Logo/Avatar */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center font-bold text-white shadow-md text-lg">
          <span>HT</span>
        </div>
        {!collapsed && (
          <div>
            <h2 className="font-semibold text-gray-900 tracking-wide text-lg">
              Healthcare TestGen
            </h2>
            <p className="text-xs text-gray-500">Session: {sessionId}</p>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => onNewChat?.()}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          {!collapsed && (
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Chats ({chats.length})
            </h3>
          )}
        </div>

        <div className="space-y-1 px-2">
          {chats.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              {!collapsed && 'No chats yet. Click "New Chat" to start.'}
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect?.(chat.id)}
                className={`w-full flex items-center gap-2 text-left p-3 rounded-md transition-all duration-200 cursor-pointer ${
                  currentChatId === chat.id
                    ? "bg-blue-50 border border-blue-200 shadow"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center font-bold text-blue-700 shadow text-xs">
                  {chat.title?.[0]?.toUpperCase() || "C"}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {chat.last_message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        {!collapsed && "// TODO: need to attach api here"}
      </div>
    </aside>
  );
}
export default Sidebar;
