"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChats,
  sendMessage,
  fetchRAGContext,
  getSessionDetails,
  editRequirements,
  analyzeRequirements,
} from "@/lib/api";
import type { Message, Chat } from "@/lib/types";

type WorkflowStep =
  | "no-chat"
  | "context-fetched"
  | "analyze"
  | "edit-analysis"
  | "generate-testcases"
  | "complete";

export function useWorkflow(sessionId: string) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("no-chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [agentAnalysis, setAgentAnalysis] = useState("");

  const queryClient = useQueryClient();

  // Fetch session details
  const { data: sessionDetails, isLoading: sessionDetailsLoading } = useQuery({
    queryKey: ["sessionDetails", sessionId],
    queryFn: () => getSessionDetails(sessionId),
    enabled: !!sessionId,
  });

  React.useEffect(() => {
    if (sessionDetails) {
      if (sessionDetails.status === "rag_context_loaded") {
        setCurrentStep("analyze");
      }
      if (sessionDetails.status === "requirements_analyzed") {
        setCurrentStep("edit-analysis");
      }
      if (sessionDetails.status === "test_cases_generated") {
        setCurrentStep("complete");
      }
      if (sessionDetails.status === "created") {
        setCurrentStep("no-chat");
      }
    }
  }, [sessionDetails, setCurrentStep]);

  // Fetch chats for session
  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ["chats", sessionId],
    queryFn: () => getChats(sessionId),
    enabled: !!sessionId,
  });

  // Fetch RAG context mutation
  const fetchContextMutation = useMutation({
    mutationFn: ({ prompt }: { prompt: string }) =>
      fetchRAGContext(sessionId, prompt),
    onSuccess: (data, variables) => {
      // Create new chat
      const newChatId = `chat-${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        title: "Healthcare Analysis",
        session_id: sessionId,
        last_message: "Context fetched",
        updated_at: new Date().toISOString(),
      };

      // Update chats cache
      queryClient.setQueryData(["chats", sessionId], (old: any) => ({
        chats: [newChat, ...(old?.chats || [])],
      }));

      // Set current chat and add context message
      setCurrentChatId(newChatId);
      const contextMessage: Message = {
        id: `ctx-${Date.now()}`,
        role: "system",
        text: `Context Retrieved: ${data.summary}`,
        created_at: new Date().toISOString(),
        chat_id: newChatId,
      };

      setMessages([contextMessage]);
      setCurrentStep("context-fetched");
    },
  });

  // Analyze data mutation
  const analyzeDataMutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      analyzeRequirements(sessionId, text),
    onMutate: ({ text }) => {
      // Optimistically add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        text,
        created_at: new Date().toISOString(),
        chat_id: currentChatId!,
      };
      setMessages((prev) => [...prev, userMessage]);
    },
    onSuccess: (data) => {
      // Set agent analysis
      setAgentAnalysis(data.analysis);

      const agentMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: "agent",
        text: data.analysis,
        created_at: new Date().toISOString(),
        chat_id: currentChatId!,
      };

      setMessages((prev) => [...prev, agentMessage]);
      setCurrentStep("edit-analysis");
      queryClient.refetchQueries({ queryKey: ["sessionDetails", sessionId] });
    },
  });

  // Edit analysis mutation
  const editAnalysisMutation = useMutation({
    mutationFn: ({
      sessionId,
      requirements,
    }: {
      sessionId: string;
      requirements: string[];
    }) => editRequirements(sessionId, requirements),
    onSuccess: (data) => {
      setCurrentStep("generate-testcases");
      // Update session details in cache
      queryClient.setQueryData(["sessionDetails", sessionId], (old: any) => ({
        ...old,
        status: "requirements_edited",
      }));
    },
  });

  const editAnalysis = (requirements: string[]) => {
    editAnalysisMutation.mutate({
      sessionId: sessionId,
      requirements: requirements,
    });
  };

  return {
    // State
    currentChatId,
    setCurrentChatId,
    currentStep,
    setCurrentStep,
    messages,
    setMessages,
    userPrompt,
    setUserPrompt,
    agentAnalysis,
    setAgentAnalysis,

    // Data
    chats: chatsData?.chats || [],
    chatsLoading,

    // Mutations
    fetchContext: fetchContextMutation.mutate,
    fetchContextLoading: fetchContextMutation.isPending,

    analyzeData: analyzeDataMutation.mutate,
    analyzeDataLoading: analyzeDataMutation.isPending,

    // Session Details
    sessionDetails: sessionDetails,
    sessionDetailsLoading,
  };
}
