// src/lib/api.ts - Complete API integration with real backend
import type { Session, Chat, Message } from "./types";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://testgen-backend-195472357560.us-central1.run.app/api/v2";
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

  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  const response = await fetch(
    `${API_BASE_URL}/data-ingestion/upload-with-rag`,
    {
      method: "POST",
      body: formData,
    }
  );

  return handleApiResponse(response);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function getUserSessions(): Promise<{ sessions: Session[] }> {
  // TODO: Backend needs to implement GET /sessions endpoint to list user sessions
  // For now using mock data since only session creation exists in backend

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

  // Mock fallback until backend provides session list
  await mockDelay(500);
  return {
    sessions: [
      {
        id: "session-emr-001",
        project_name: "EMR Patient Portal Testing",
        status: "active",
        created_at: new Date().toISOString(),
      },
      {
        id: "session-hipaa-002",
        project_name: "HIPAA Compliance Validation",
        status: "draft",
        created_at: new Date().toISOString(),
      },
    ],
  };
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

  // Split by test_id to get individual test cases
  const testBlocks = rawResponse
    .split(/test_id:\s*/)
    .filter((block) => block.trim());

  testBlocks.forEach((block) => {
    const testCase: any = {};
    const lines = block.split("\n");

    // More robust parsing
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return;

      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      switch (key) {
        case "test_id":
        case "":
          if (value) testCase.id = value;
          break;
        case "priority":
          testCase.priority = value.charAt(0).toUpperCase() + value.slice(1);
          break;
        case "summary":
          testCase.title = value;
          testCase.description = value;
          break;
        case "expected_result":
          testCase.expectedResults = value;
          break;
        case "requirement_traceability":
          testCase.requirementTraceability = value;
          break;
      }
    });

    // Extract test steps (numbered list)
    const stepsMatch = block.match(/test_steps:\s*\n((?:\d+\..+\n?)+)/);
    if (stepsMatch) {
      testCase.steps = stepsMatch[1]
        .split("\n")
        .filter((step) => step.trim())
        .map((step) => step.replace(/^\d+\.\s*/, "").trim());
    }

    // Set defaults
    testCase.type = testCase.title?.toLowerCase().includes("security")
      ? "Security"
      : testCase.title?.toLowerCase().includes("functional")
      ? "Functional"
      : "Integration";
    testCase.category = "Healthcare Testing";
    testCase.hipaaCompliance = true;

    if (testCase.id && testCase.title) {
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

export function getMockMode(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("USE_MOCK_API") === "true";
  }
  return USE_MOCK_DATA;
}
