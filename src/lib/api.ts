"use client";
import type { Session, Chat, Message, UserSessions } from "./types";
import { BACKEND_URL } from "./constants";

// API Configuration
const API_BASE_URL = BACKEND_URL + "/api/v2";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// User ID - In production, get this from auth context
const CURRENT_USER_ID = "user123";

// Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
}

// Mock delay for realistic UX
const mockDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// DATA INGESTION
// ============================================================================

export async function uploadDocument(
  file: File,
  documentId: string,
  documentType: string = "requirements",
  enableRag: boolean = true,
  metadata?: Record<string, any>
): Promise<{
  status: string;
  document_id: string;
  processing_result: any;
  rag_ingestion?: any;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_id", documentId);
  formData.append("document_type", documentType);
  formData.append("enable_rag", enableRag.toString());

  const response = await fetch(
    `${API_BASE_URL}/data-ingestion/upload-with-rag`,
    {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }
  );

  return handleApiResponse(response);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function getUserSessions(): Promise<{ sessions: Session[] }> {
  if (USE_MOCK_DATA) {
    await mockDelay(800);
    return {
      sessions: [
        {
          id: "session-emr-001",
          project_name: "EMR Patient Portal Testing",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-20T14:22:00Z",
        },
        {
          id: "session-hipaa-002",
          project_name: "HIPAA Compliance Validation",
          status: "completed",
          created_at: "2024-01-10T09:15:00Z",
          updated_at: "2024-01-18T16:45:00Z",
        },
        {
          id: "session-telehealth-003",
          project_name: "Telehealth Platform Integration",
          status: "draft",
          created_at: "2024-01-22T11:00:00Z",
          updated_at: "2024-01-22T11:00:00Z",
        },
      ],
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sessions/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<
      {
        session_id: string;
        user_id: string;
        project_name: string;
        status: string;
        message: string;
        database_saved: boolean;
      }[]
    >(response);

    const sessions: Session[] = result.map((sessionData) => ({
      id: sessionData.session_id,
      project_name: sessionData.project_name,
      status:
        sessionData.status === "created"
          ? "draft"
          : (sessionData.status as Session["status"]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return { sessions };
  } catch (error) {
    console.error("Get user sessions API error:", error);
    throw error;
  }
}

export async function createSession(data: {
  project_name: string;
}): Promise<{ session: Session }> {
  if (USE_MOCK_DATA) {
    await mockDelay(1200);
    const newSession: Session = {
      id: `session-${Date.now()}`,
      project_name: data.project_name,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { session: newSession };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sessions/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID,
        project_name: data.project_name,
      }),
    });

    const result = await handleApiResponse<{
      session_id: string;
      user_id: string;
      project_name: string;
      status: string;
      message: string;
      database_saved: boolean;
    }>(response);

    const session: Session = {
      id: result.session_id,
      project_name: result.project_name,
      status:
        result.status === "created"
          ? "draft"
          : (result.status as Session["status"]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { session };
  } catch (error) {
    console.error("Create session API error:", error);
    throw error;
  }
}

// ============================================================================
// CHAT MANAGEMENT (Mock - Not implemented in backend yet)
// ============================================================================

export async function getChats(sessionId: string): Promise<{ chats: Chat[] }> {
  // TODO: Implement backend API call for fetching chats
  await mockDelay(600);

  const mockChats = [
    {
      id: "chat-001",
      title: "Patient Authentication Analysis",
      session_id: sessionId,
      last_message: "Analysis complete - ready for test generation",
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "chat-002",
      title: "Medical Device Integration",
      session_id: sessionId,
      last_message: "Generated 23 comprehensive test cases",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "chat-003",
      title: "HIPAA Data Validation",
      session_id: sessionId,
      last_message: "Context fetched from compliance documentation",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  return { chats: mockChats };
}

export async function getMessages(
  chatId: string
): Promise<{ messages: Message[] }> {
  // TODO: Implement backend API call for fetching messages
  await mockDelay(400);

  return {
    messages: [
      {
        id: "msg-system-001",
        role: "system",
        text: "Healthcare Context Retrieved...",
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        chat_id: chatId,
      },
      {
        id: "msg-user-001",
        role: "user",
        text: "Thoroughly analyse the patient authentication workflow...",
        created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        chat_id: chatId,
      },
      {
        id: "msg-agent-001",
        role: "agent",
        text: "Healthcare Analysis Complete...",
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        chat_id: chatId,
      },
    ],
  };
}

// ============================================================================
// RAG CONTEXT FETCHING
// ============================================================================

export async function fetchRAGContext(
  sessionId: string,
  prompt: string
): Promise<{ summary: string; context_id?: string }> {
  if (USE_MOCK_DATA) {
    await mockDelay(2000);
    return {
      summary: `Mock context for prompt: ${prompt}`,
      context_id: `ctx-${Date.now()}`,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/rag/fetch-and-save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          prompt,
          user_id: CURRENT_USER_ID,
        }),
      }
    );

    const result = await handleApiResponse<any>(response);

    const summary = `Healthcare Context Retrieved: ${result.message}. Found ${result.rag_items_count} relevant items.`;

    return {
      summary,
      context_id: result.cache_key,
    };
  } catch (error) {
    console.error("Fetch RAG context API error:", error);
    throw error;
  }
}

// ============================================================================
// REQUIREMENTS ANALYSIS
// ============================================================================

export async function analyzeRequirements(
  sessionId: string,
  prompt: string
): Promise<{ analysis: string; agent_used?: string }> {
  if (USE_MOCK_DATA) {
    await mockDelay(2000);
    return {
      analysis: `Mock analysis for: ${prompt}`,
      agent_used: "mock_agent",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/requirements/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        prompt,
      }),
    });

    const result = await handleApiResponse<any>(response);

    return {
      analysis: result.requirements.response,
      agent_used: result.agent_used,
    };
  } catch (error) {
    console.error("Analyze requirements API error:", error);
    throw error;
  }
}

export async function editRequirements(
  sessionId: string,
  requirements: string[]
): Promise<{ status: string; message: string }> {
  if (USE_MOCK_DATA) {
    await mockDelay(2000);
    return {
      status: "success",
      message: "Requirements updated successfully",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/requirements/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirements: requirements,
      }),
    });

    const result = await handleApiResponse<any>(response);

    return {
      status: "success",
      message: result.message,
    };
  } catch (error) {
    console.error("Edit requirements API error:", error);
    throw error;
  }
}

// ============================================================================
// TEST CASE GENERATION
// ============================================================================

export async function generateTestCases(
  sessionId: string,
  prompt?: string
): Promise<{ testCases: any[]; rawResponse?: string }> {
  if (USE_MOCK_DATA) {
    await mockDelay(3000);
    return { testCases: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/test-cases/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        prompt:
          prompt ||
          "Generate comprehensive test cases for healthcare application",
      }),
    });

    const result = await handleApiResponse<any>(response);

    // Parse the test cases from the raw response
    // TODO: Backend should ideally return structured JSON instead of markdown text
    // Current implementation is fragile to format changes
    const testCases = parseTestCasesFromResponse(result.test_cases);

    return {
      testCases,
      rawResponse: result.test_cases,
    };
  } catch (error) {
    console.error("Generate test cases API error:", error);
    throw error;
  }
}

// Helper function to parse test cases from backend response
function parseTestCasesFromResponse(rawResponse: string): any[] {
  const testCases: any[] = [];

  // Split the raw response into individual test cases
  const testCaseBlocks = rawResponse
    .split("---\n\n")
    .filter((block) => block.includes("test_id:"));

  testCaseBlocks.forEach((block) => {
    const testCase: any = {};
    const lines = block.split("\n");

    lines.forEach((line) => {
      if (line.startsWith("**test_id:**")) {
        testCase.name = line.split(":")[1].trim();
      } else if (line.startsWith("**priority:**")) {
        testCase.priority = line.split(":")[1].trim();
      } else if (line.startsWith("**summary:**")) {
        testCase.description = line.split(":")[1].trim();
      } else if (line.startsWith("**test_steps:**")) {
        const steps = [];
        let i = lines.indexOf(line) + 1;
        while (i < lines.length && !lines[i].startsWith("**")) {
          if (lines[i].trim() !== "") {
            steps.push(lines[i].replace(/^\d+\.\s*/, "").trim());
          }
          i++;
        }
        testCase.steps = steps;
      } else if (line.startsWith("**expected_result:**")) {
        testCase.expectedResults = line.split(":")[1].trim();
      }
    });

    testCase.type = "edge"; // Default type

    if (
      testCase.name &&
      testCase.description &&
      testCase.steps &&
      testCase.expectedResults &&
      testCase.priority
    ) {
      testCases.push(testCase);
    }
  });

  return testCases;
}

// ============================================================================
// MESSAGE HANDLING (Mock - for chat interface)
// ============================================================================

export async function sendMessage(
  chatId: string,
  text: string
): Promise<{ agent_reply: Message }> {
  await mockDelay(1500);
  const agentReply: Message = {
    id: `msg-${Date.now()}`,
    role: "agent",
    text: `Mock agent reply for: "${text}"`,
    created_at: new Date().toISOString(),
    chat_id: chatId,
  };
  return { agent_reply: agentReply };
}

// ============================================================================
// UPDATE ANALYSIS (Dummy API for now)
// ============================================================================

export async function getSessionDetails(sessionId: string): Promise<{
  session_id: string;
  user_id: string;
  project_name: string;
  user_prompt: string;
  status: string;
  created_at: string;
  updated_at: string;
  requirements_count: number;
  edited_requirements_count: number;
  test_cases_count: number;
  requirement_test_links_count: number;
  requirements: Array<{
    id: string;
    session_id: string;
    original_content: string;
    edited_content: string | null;
    requirement_type:
      | "functional"
      | "non_functional"
      | "business_rule"
      | "rag_context"
      | "security"
      | "performance"
      | "usability";
    priority: "low" | "medium" | "high" | "critical";
    status: "active" | "inactive" | "deprecated";
    version: number;
    created_at: string;
    updated_at: string;
  }>;
  test_cases: Array<{
    id: string;
    session_id: string;
    test_name: string;
    test_description: string;
    test_steps: string[];
    expected_results: string;
    test_type:
      | "functional"
      | "integration"
      | "security"
      | "performance"
      | "usability"
      | "edge"
      | "regression";
    priority: "low" | "medium" | "high" | "critical";
    status: "active" | "inactive" | "passed" | "failed" | "blocked";
    created_at: string;
    updated_at: string;
    linked_requirements: string[];
  }>;
}> {
  if (USE_MOCK_DATA) {
    await mockDelay(800);
    return {
      session_id: sessionId,
      user_id: "user123",
      project_name: "Authentication System Testing",
      user_prompt: "Session creation",
      status: "test_cases_generated", // Example status
      created_at: "2025-09-20T17:33:06.404379",
      updated_at: "2025-09-20T17:36:54.719095",
      requirements_count: 52,
      edited_requirements_count: 0,
      test_cases_count: 23,
      requirement_test_links_count: 0,
      requirements: [
        {
          id: `session_${sessionId}_req_001`,
          session_id: sessionId,
          original_content:
            "The system shall allow users to log in with valid credentials.",
          edited_content: null, // Or some edited content if available
          requirement_type: "functional",
          priority: "high",
          status: "active",
          version: 1,
          created_at: "2025-09-20T17:33:06.404379",
          updated_at: "2025-09-20T17:33:06.404379",
        },
        // Add more mock requirements if needed
      ],
      test_cases: [
        // Mock test cases if needed, similar to the structure provided
      ],
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleApiResponse<ApiSessionDetailsResponse>(response); // Use the specific type here

    // Map the result to the function's return type
    return {
      session_id: result.session_id,
      user_id: result.user_id,
      project_name: result.project_name,
      user_prompt: result.user_prompt,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
      requirements_count: result.requirements_count,
      edited_requirements_count: result.edited_requirements_count,
      test_cases_count: result.test_cases_count,
      requirement_test_links_count: result.requirement_test_links_count,
      requirements: result.requirements || [], // Use provided requirements or empty array
      test_cases: result.test_cases || [], // Use provided test_cases or empty array
    };
  } catch (error) {
    console.error("Get session details API error:", error);
    throw error;
  }
}

export async function updateAnalysis(
  sessionId: string,
  updatedAnalysis: string
): Promise<{ status: string; message: string }> {
  await mockDelay(800);

  // TODO: Backend needs to implement PUT/PATCH endpoint for updating analysis
  // Currently no backend endpoint exists for this functionality
  return {
    status: "success",
    message: "Analysis updated successfully and saved to session context",
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function setMockMode(useMock: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("USE_MOCK_API", useMock.toString());
  }
}

export async function getActiveSessions(): Promise<{ sessions: Session[] }> {
  // TODO: Replace CURRENT_USER_ID with the actual user ID from the authentication context
  const userId = CURRENT_USER_ID;

  if (USE_MOCK_DATA) {
    await mockDelay(800);
    return {
      sessions: [
        {
          id: "session-emr-001",
          project_name: "EMR Patient Portal Testing",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-20T14:22:00Z",
        },
        {
          id: "session-hipaa-002",
          project_name: "HIPAA Compliance Validation",
          status: "completed",
          created_at: "2024-01-10T09:15:00Z",
          updated_at: "2024-01-18T16:45:00Z",
        },
        {
          id: "session-telehealth-003",
          project_name: "Telehealth Platform Integration",
          status: "draft",
          created_at: "2024-01-22T11:00:00Z",
          updated_at: "2024-01-22T11:00:00Z",
        },
      ],
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/users/${userId}/sessions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleApiResponse<UserSessions>(response);

    const sessions: Session[] = result.sessions.map((sessionData) => ({
      id: sessionData.session_id,
      project_name: sessionData.project_name,
      status:
        sessionData.status === "created"
          ? "draft"
          : (sessionData.status as Session["status"]),
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at,
    }));

    return { sessions };
  } catch (error) {
    console.error("Get active sessions API error:", error);
    throw error;
  }
}

export function getMockMode(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("USE_MOCK_API") === "true";
  }
  return USE_MOCK_DATA;
}

export const api = {
  uploadDocument,
  getUserSessions,
  createSession,
  getChats,
  getMessages,
  fetchRAGContext,
  analyzeRequirements,
  editRequirements,
  generateTestCases,
  sendMessage,
  getSessionDetails,
  updateAnalysis,
  getActiveSessions,
  getMockMode,
};
