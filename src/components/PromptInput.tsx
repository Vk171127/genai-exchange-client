"use client";
import React, { useState } from "react";

interface PromptInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || disabled) return;

    onSend(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about healthcare application requirements, HIPAA compliance, patient data validation..."
            className="flex-1 min-h-[56px] max-h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={disabled}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || input.trim() === ""}
            className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
