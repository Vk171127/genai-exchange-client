import type { Session, Chat, Message } from "./types";

// TODO: need to attach API here - backend endpoints will be wired later
export async function getUserSessions(): Promise<{ sessions: Session[] }> {
  // Mock data for UI development - healthcare focused
  return {
    sessions: [
      {
        id: "session-1",
        project_name: "EMR Patient Portal",
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: "session-2",
        project_name: "HIPAA Compliance Module",
        status: "draft",
        created_at: new Date().toISOString(),
      },
      {
        id: "session-3",
        project_name: "Medical Device Integration",
        status: "completed",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  };
}

export async function createSession(payload: {
  project_name: string;
}): Promise<{ session: Session }> {
  // Mock creation - returns new session
  return {
    session: {
      id: "session-" + Date.now(),
      project_name: payload.project_name,
      status: "draft",
      created_at: new Date().toISOString(),
    },
  };
}

export async function getChats(sessionId: string): Promise<{ chats: Chat[] }> {
  // Mock chats for a healthcare session
  return {
    chats: [
      {
        id: "chat-1",
        title: "Patient data validation tests",
        session_id: sessionId,
        last_message: "Generate HIPAA compliance test cases",
        updated_at: new Date().toISOString(),
      },
      {
        id: "chat-2",
        title: "EMR security requirements",
        session_id: sessionId,
        last_message: "Analyze authentication edge cases",
        updated_at: new Date().toISOString(),
      },
    ],
  };
}

export async function getMessages(
  chatId: string
): Promise<{ messages: Message[] }> {
  // Mock messages for a healthcare chat
  return {
    messages: [
      {
        id: "msg-1",
        role: "system",
        text: "Healthcare context fetched: Found HIPAA compliance requirements, patient data validation rules, and EMR security standards.",
        created_at: new Date().toISOString(),
        chat_id: chatId,
      },
      {
        id: "msg-2",
        role: "user",
        text: "Analyze patient registration flow for edge cases and HIPAA compliance",
        created_at: new Date().toISOString(),
        chat_id: chatId,
      },
    ],
  };
}

export async function sendMessage(
  chatId: string,
  text: string
): Promise<{ message: Message; agent_reply?: Message }> {
  const userMessage: Message = {
    id: "msg-" + Date.now(),
    role: "user",
    text,
    created_at: new Date().toISOString(),
    chat_id: chatId,
  };

  // Healthcare-focused agent reply
  const healthcareResponses = [
    `Analyzing "${text}" for healthcare compliance. Key considerations include HIPAA requirements, patient data security, and medical workflow validation.`,
    `For healthcare applications, I'll examine: patient privacy safeguards, data encryption standards, audit logging requirements, and clinical workflow edge cases.`,
    `Based on healthcare regulations, testing should cover: PHI handling, consent management, provider authentication, and medical device integration scenarios.`,
  ];

  const randomResponse =
    healthcareResponses[Math.floor(Math.random() * healthcareResponses.length)];

  const agentReply: Message = {
    id: "msg-" + (Date.now() + 1),
    role: "agent",
    text: randomResponse,
    created_at: new Date().toISOString(),
    chat_id: chatId,
  };

  return { message: userMessage, agent_reply: agentReply };
}

export async function fetchRAGContext(
  sessionId: string,
  prompt: string
): Promise<{ summary: string; context_id: string }> {
  // Mock healthcare context fetch
  const healthcareSummaries = [
    `Healthcare context for "${prompt}": Found 12 relevant documents covering HIPAA compliance requirements, patient data validation standards, and medical workflow specifications. Key areas include PHI encryption, audit trails, and clinical decision support integration.`,
    `Medical context retrieved for "${prompt}": Located requirements for patient consent management, provider authentication protocols, and medical device data exchange standards. Includes FDA compliance guidelines and healthcare interoperability specifications.`,
    `Clinical context found for "${prompt}": Identified documentation on electronic health record workflows, patient safety protocols, and medical data integrity requirements. Covers both regulatory compliance and clinical best practices.`,
  ];

  const randomSummary =
    healthcareSummaries[Math.floor(Math.random() * healthcareSummaries.length)];

  return {
    summary: randomSummary,
    context_id: "ctx-" + Date.now(),
  };
}
