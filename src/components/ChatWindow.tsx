"use client";
import React, { useRef, useEffect } from "react";
import {
  User,
  Bot,
  Shield,
  Clock,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isFirst={index === 0}
                onCopy={() => copyToClipboard(message.text)}
              />
            ))
          )}

          {/* Generate Test Cases Button */}
          {messages.some((m) => m.role === "agent") && (
            <div className="flex justify-center pt-8">
              <button
                onClick={onGenerateTestCases}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Generate Healthcare Test Cases
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isFirst,
  onCopy,
}: {
  message: Message;
  isFirst: boolean;
  onCopy: () => void;
}) {
  const getMessageConfig = (role: string) => {
    switch (role) {
      case "user":
        return {
          align: "justify-end",
          bgClass: "bg-gradient-to-br from-blue-600 to-purple-600",
          textColor: "text-white",
          icon: User,
          iconBg: "from-blue-500 to-purple-500",
          name: "You",
          nameColor: "text-blue-300",
        };
      case "agent":
        return {
          align: "justify-start",
          bgClass: "bg-slate-800/80 backdrop-blur-sm border border-slate-700",
          textColor: "text-slate-100",
          icon: Bot,
          iconBg: "from-emerald-500 to-teal-500",
          name: "Healthcare AI",
          nameColor: "text-emerald-300",
        };
      case "system":
        return {
          align: "justify-center",
          bgClass:
            "bg-amber-500/10 backdrop-blur-sm border border-amber-500/30",
          textColor: "text-amber-100",
          icon: Shield,
          iconBg: "from-amber-500 to-orange-500",
          name: "System",
          nameColor: "text-amber-300",
        };
      default:
        return {
          align: "justify-start",
          bgClass: "bg-slate-800",
          textColor: "text-slate-100",
          icon: Bot,
          iconBg: "from-gray-500 to-gray-600",
          name: "Unknown",
          nameColor: "text-gray-300",
        };
    }
  };

  const config = getMessageConfig(message.role);
  const Icon = config.icon;

  return (
    <div className={`flex ${config.align} group`}>
      <div
        className={`relative max-w-4xl ${
          message.role === "system" ? "w-full" : "max-w-3xl"
        }`}
      >
        {/* Message Container */}
        <div
          className={`${config.bgClass} ${
            config.textColor
          } rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:shadow-xl ${
            isFirst
              ? "animate-[slideIn_0.6s_ease-out]"
              : "animate-[fadeIn_0.4s_ease-out]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-md`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`font-semibold text-sm ${config.nameColor}`}>
                  {config.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {message.created_at}
                    {/* {formatTime(message.created_at)} */}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onCopy}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy message"
              >
                <Copy className="w-4 h-4 text-slate-400 hover:text-slate-200" />
              </button>
              {message.role === "agent" && (
                <>
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="w-4 h-4 text-slate-400 hover:text-green-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Poor response"
                  >
                    <ThumbsDown className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-base">
              {message.text}
            </div>
          </div>

          {/* Healthcare context badge for system messages */}
          {message.role === "system" &&
            message.text.toLowerCase().includes("healthcare") && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                <Shield className="w-3 h-3" />
                Healthcare Context Loaded
              </div>
            )}
        </div>

        {/* Message tail */}
        <div
          className={`absolute top-6 w-3 h-3 transform rotate-45 ${
            message.role === "user"
              ? "right-0 translate-x-1 bg-gradient-to-br from-blue-600 to-purple-600"
              : message.role === "system"
              ? "left-1/2 -translate-x-1/2 -translate-y-1 bg-amber-500/10 border-l border-t border-amber-500/30"
              : "left-0 -translate-x-1 bg-slate-800 border-l border-t border-slate-700"
          }`}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="relative inline-block mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">
        Healthcare AI Ready
      </h3>
      <p className="text-slate-400 text-lg mb-6 max-w-md mx-auto">
        Start by fetching context for your healthcare application, then begin
        analysis for test case generation.
      </p>

      <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          HIPAA Compliant
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          AI Analysis Ready
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
          Test Gen Enabled
        </div>
      </div>
    </div>
  );
}
