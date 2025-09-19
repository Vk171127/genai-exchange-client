"use client";
import React, { useState } from "react";
import {
  Plus,
  ArrowLeft,
  MessageSquare,
  Bot,
  CheckCircle,
  Zap,
  Activity,
  Settings,
} from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);

  const getChatIcon = (title: string) => {
    if (
      title.toLowerCase().includes("security") ||
      title.toLowerCase().includes("hipaa")
    )
      return Bot;
    if (
      title.toLowerCase().includes("data") ||
      title.toLowerCase().includes("validation")
    )
      return CheckCircle;
    if (
      title.toLowerCase().includes("analysis") ||
      title.toLowerCase().includes("test")
    )
      return Zap;
    return MessageSquare;
  };

  const getChatStatus = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffHours = Math.abs(now.getTime() - updated.getTime()) / 36e5;

    if (diffHours < 1) return { label: "Live", dot: "bg-green-400" };
    if (diffHours < 24) return { label: "Recent", dot: "bg-blue-400" };
    return { label: "Idle", dot: "bg-gray-400" };
  };

  return (
    <aside
      className={`relative bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/40 flex flex-col shadow-2xl transition-all duration-300 ease-out ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />

      {/* Collapse Toggle */}
      <button
        className="absolute -right-3 top-6 z-20 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/50 rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-105"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        <ArrowLeft
          className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">HT</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-slate-900 animate-pulse" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-base tracking-tight">
                Healthcare TestGen
              </h2>
              <p className="text-slate-400 text-xs truncate">
                Session: {sessionId.slice(-6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="relative z-10 p-3">
        <button
          onClick={() => onNewChat?.()}
          className={`group w-full flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          {!collapsed && <span>New Analysis</span>}
        </button>
      </div>

      {/* Chat List Header */}
      {!collapsed && (
        <div className="relative z-10 px-4 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Active Chats
            </h3>
            <span className="text-xs bg-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded">
              {chats.length}
            </span>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="px-2 pb-3 space-y-1">
            {chats.length === 0 ? (
              <div
                className={`text-center py-6 ${collapsed ? "px-1" : "px-3"}`}
              >
                {!collapsed ? (
                  <div className="text-slate-400">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No chats yet</p>
                    <p className="text-xs mt-1 opacity-75">
                      Click "New Analysis"
                    </p>
                  </div>
                ) : (
                  <MessageSquare className="w-5 h-5 text-slate-400 opacity-50 mx-auto" />
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
                    className={`group w-full flex items-center gap-2.5 text-left p-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-md"
                        : "hover:bg-slate-800/40 border border-transparent hover:border-slate-600/30"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    {/* Chat Icon */}
                    <div
                      className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm"
                          : "bg-slate-700/60 group-hover:bg-slate-700"
                      }`}
                    >
                      <ChatIcon
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-white" : "text-slate-300"
                        }`}
                      />
                      <div
                        className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${status.dot} rounded-full border border-slate-900`}
                      />
                    </div>

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`font-medium text-xs truncate ${
                              isActive
                                ? "text-white"
                                : "text-slate-200 group-hover:text-white"
                            }`}
                          >
                            {chat.title}
                          </h4>
                          <span
                            className={`text-xs ${
                              isActive ? "text-blue-300" : "text-slate-500"
                            }`}
                          >
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
                          {chat.last_message || "No messages"}
                        </p>

                        <div className="flex items-center justify-between mt-1">
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
                              <Activity className="w-2.5 h-2.5 text-green-400 animate-pulse" />
                              <span className="text-xs text-green-400">
                                Active
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-3 border-t border-slate-700/40">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">System Ready</span>
            </div>
            <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
