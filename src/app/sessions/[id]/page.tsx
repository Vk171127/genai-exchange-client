"use client";
import { useParams } from "next/navigation";
import WorkflowChatInterface from "@/components/WorkflowChatInterface";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Invalid session ID</div>
      </div>
    );
  }

  return <WorkflowChatInterface sessionId={sessionId} />;
}
