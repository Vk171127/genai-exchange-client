"use client";
import type { Session, UserSessions } from "./types";

interface ApiSessionDetailsResponse {
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
    // priority: "low" | "medium" | "high" | "critical";
    // status: "active" | "inactive" | "deprecated";
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
    // priority: "low" | "medium" | "high" | "critical";
    // status: "active" | "inactive" | "passed" | "failed" | "blocked";
    created_at: string;
    updated_at: string;
    linked_requirements: string[];
  }>;
}

import { BACKEND_URL } from "./constants";

// API Configuration
const API_BASE_URL = BACKEND_URL + "/api/v2";

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
    console.log(response);
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData);
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

// export async function getUserSessions(): Promise<{ sessions: Session[] }> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/sessions/sessions`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const result = await handleApiResponse<
//       {
//         session_id: string;
//         user_id: string;
//         project_name: string;
//         status: string;
//         message: string;
//         database_saved: boolean;
//       }[]
//     >(response);

//     const sessions: Session[] = result.map((sessionData) => ({
//       id: sessionData.session_id,
//       project_name: sessionData.project_name,
//       status:
//         sessionData.status === "created"
//           ? "draft"
//           : (sessionData.status as Session["status"]),
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     }));

//     return { sessions };
//   } catch (error) {
//     console.error("Get user sessions API error:", error);
//     throw error;
//   }
// }

export async function createSession(data: {
  project_name: string;
}): Promise<{ session: Session }> {
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
// RAG CONTEXT FETCHING
// ============================================================================

export async function fetchRAGContext(
  sessionId: string,
  prompt: string
): Promise<{ summary: string; context_id?: string }> {
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
  try {
    const response = await fetch(`${API_BASE_URL}/requirements/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   session_id: sessionId,
      //   prompt,
      // }),
      body: JSON.stringify({
        app_name: "decider-orchestrator-app",
        user_id: "user123",
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [
            {
              text: "start; " + prompt,
            },
          ],
        },
        streaming: false,
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
  try {
    const response = await fetch(`${API_BASE_URL}/requirements/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirements: "edited" + requirements,
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
    ?.split("---\n\n")
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
    // priority: "low" | "medium" | "high" | "critical";
    // status: "active" | "inactive" | "deprecated";
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
    // priority: "low" | "medium" | "high" | "critical";
    // status: "active" | "inactive" | "passed" | "failed" | "blocked";
    created_at: string;
    updated_at: string;
    linked_requirements: string[];
  }>;
}> {
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

    const result = await handleApiResponse<ApiSessionDetailsResponse>(response);

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
      requirements: result.requirements || [],
      test_cases: result.test_cases || [],
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
  const mockDelay = (ms: number = 800) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await mockDelay(800);

  // TODO: Backend needs to implement PUT/PATCH endpoint for updating analysis
  // Currently no backend endpoint exists for this functionality
  return {
    status: "success",
    message: "Analysis updated successfully and saved to session context",
  };
}

// export async function updateSessions(sessionId: string): Promise<any> {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/sessions/sessions/${sessionId}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           session_id: sessionId,
//         }),
//       }
//     );

//     const result = await handleApiResponse<ApiSessionDetailsResponse>(response);

//     return {
//       session_id: result.session_id,
//       user_id: result.user_id,
//       project_name: result.project_name,
//       status: result.status,
//       created_at: result.created_at,
//       updated_at: result.updated_at,
//       requirements_count: result.requirements_count,
//       edited_requirements_count: result.edited_requirements_count,
//       test_cases_count: result.test_cases_count,
//       requirement_test_links_count: result.requirement_test_links_count,
//       requirements: result.requirements || [],
//       test_cases: result.test_cases || [],
//     };
//   } catch (error) {
//     console.error("Update session API error:", error);
//     throw error;
//   }
// }

export async function getActiveSessions(): Promise<{ sessions: Session[] }> {
  // TODO: Replace CURRENT_USER_ID with the actual user ID from the authentication context
  const userId = CURRENT_USER_ID;

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

export const api = {
  createSession,
  fetchRAGContext,
  analyzeRequirements,
  editRequirements,
  generateTestCases,
  getSessionDetails,
  updateAnalysis,
  getActiveSessions,
};
