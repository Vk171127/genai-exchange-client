"use client";
import React, { useState } from "react";
import {
  Plus,
  ArrowLeft,
  MessageSquare,
  Bot,
  Clock,
  CheckCircle,
  Zap,
  Activity,
} from "lucide-react";
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

  const getChatIcon = (title: string) => {
    if (
      title.toLowerCase().includes("security") ||
      title.toLowerCase().includes("hipaa")
    ) {
      return Bot;
    }
    if (
      title.toLowerCase().includes("data") ||
      title.toLowerCase().includes("validation")
    ) {
      return CheckCircle;
    }
    if (
      title.toLowerCase().includes("analysis") ||
      title.toLowerCase().includes("test")
    ) {
      return Zap;
    }
    return MessageSquare;
  };

  const getChatStatus = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffHours = Math.abs(now.getTime() - updated.getTime()) / 36e5;

    if (diffHours < 1)
      return { label: "Active", color: "text-green-400", dot: "bg-green-400" };
    if (diffHours < 24)
      return { label: "Recent", color: "text-blue-400", dot: "bg-blue-400" };
    return { label: "Idle", color: "text-gray-400", dot: "bg-gray-400" };
  };

  return (
    <aside
      className={`relative bg-slate-900/80 backdrop-blur-md border-r border-slate-700/50 flex flex-col shadow-2xl transition-all duration-500 ease-out ${
        collapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

      {/* Collapse Toggle */}
      <button
        className="absolute -right-4 top-8 z-20 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle sidebar"
      >
        <ArrowLeft
          className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">HT</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg tracking-tight">
                Healthcare TestGen
              </h2>
              <p className="text-slate-400 text-sm truncate">
                Session: {sessionId.slice(-8)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="relative z-10 p-4">
        <button
          onClick={() => onNewChat?.()}
          className={`group w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          {!collapsed && <span>New Healthcare Chat</span>}

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
        </button>
      </div>

      {/* Chat List Header */}
      {!collapsed && (
        <div className="relative z-10 px-6 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Analysis Chats
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
              {chats.length}
            </span>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="px-3 pb-4 space-y-2">
            {chats.length === 0 ? (
              <div
                className={`text-center py-8 ${collapsed ? "px-2" : "px-4"}`}
              >
                {!collapsed ? (
                  <div className="text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No analysis chats yet</p>
                    <p className="text-xs mt-1 opacity-75">
                      Start with "New Chat"
                    </p>
                  </div>
                ) : (
                  <MessageSquare className="w-6 h-6 text-slate-400 opacity-50" />
                )}
              </div>
            ) : (
              chats.map((chat) => {
                const ChatIcon = getChatIcon(chat.title);
                const status = getChatStatus(chat.updated_at);
                const isActive = currentChatId === chat.id;

                return (
                  <button
                    key={chat.id}
                    onClick={() => onChatSelect?.(chat.id)}
                    className={`group w-full flex items-center gap-3 text-left p-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg scale-105"
                        : "hover:bg-slate-800/50 border border-transparent"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {/* Chat Icon */}
                    <div
                      className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                          : "bg-slate-800 group-hover:bg-slate-700"
                      }`}
                    >
                      <ChatIcon
                        className={`w-5 h-5 ${
                          isActive ? "text-white" : "text-slate-300"
                        }`}
                      />

                      {/* Status dot */}
                      <div
                        className={`absolute -top-0.5 -right-0.5 w-3 h-3 ${status.dot} rounded-full border-2 border-slate-900`}
                      ></div>
                    </div>

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`font-medium text-sm truncate ${
                              isActive
                                ? "text-white"
                                : "text-slate-200 group-hover:text-white"
                            }`}
                          >
                            {chat.title}
                          </h4>
                          <span className={`text-xs ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <p
                          className={`text-xs truncate ${
                            isActive
                              ? "text-blue-200"
                              : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        >
                          {chat.last_message || "No messages yet"}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs ${
                              isActive ? "text-blue-300" : "text-slate-500"
                            }`}
                          >
                            {new Date(chat.updated_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>

                          {isActive && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                              <span className="text-xs text-green-400">
                                Active
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"></div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-slate-700/50">
        {!collapsed ? (
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2">
              AI-Powered Healthcare Testing
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              System Ready
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
