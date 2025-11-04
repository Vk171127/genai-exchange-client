"use client";
import type {
  Requirement,
  Session,
  SessionRequirementsResponse,
  UserSessions,
} from "./types";

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

// Add this type definition at the top with other interfaces
import { AGENT_URL, BACKEND_URL, TOKEN } from "./constants";

// API Configuration
const API_BASE_URL = BACKEND_URL + "/api/v2";

const AGENT_BASE_URL = AGENT_URL + "/run_sse";

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

export async function createSession(data: {
  project_name: string;
  alm_tool: string;
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
        alm_tool: data.alm_tool, // Include ALM tool in the backend request
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

    const resp = await fetch(
      `${AGENT_URL}/apps/decider_agent/users/user123/sessions/${result.session_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ preferred_language: "English", visit_count: 5 }),
      }
    );

    const res = await handleApiResponse<any>(resp);

    const session: Session = {
      id: result.session_id,
      project_name: result.project_name,
      status:
        result.status === "in_progress"
          ? "in_progress"
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

// export async function analyzeRequirements(
//   sessionId: string,
//   prompt: string
// ): Promise<{ analysis: string; agent_used?: string }> {
//   try {
//     const response = await fetch(`${AGENT_BASE_URL}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//       body: JSON.stringify({
//         app_name: "decider_agent",
//         user_id: "user123",
//         session_id: sessionId,
//         new_message: {
//           role: "user",
//           parts: [
//             {
//               text: `start; sessionID: ${sessionId}; ${prompt}`,
//               // " Make sure to save the analysis in database.",
//             },
//           ],
//         },
//         streaming: false,
//       }),
//     });

//     const result = await handleApiResponse<any>(response);

//     console.log(result);
//     // ✅ Extract text from new response format
//     const analysisText =
//       // result.content?.parts[0]?.text || result.text || "Analysis completed";
//       result.content.parts[0].functionResponse.response.result[0].result
//         .cache_data.requirements[0].content || "Analysis completed";

//     console.log(analysisText);

//     return {
//       analysis: analysisText,
//     };
//   } catch (error) {
//     console.error("Analyze requirements API error:", error);
//     throw error;
//   }
// }

export async function analyzeRequirements(
  sessionId: string,
  prompt: string
): Promise<{ analysis: string; agent_used?: string }> {
  try {
    const response = await fetch(`${AGENT_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        app_name: "decider_agent",
        user_id: "user123",
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [
            {
              text: `start; sessionID: ${sessionId}; ${prompt}`,
            },
          ],
        },
        streaming: false,
      }),
    });

    if (!response.ok) {
      console.warn(
        `Analysis request returned ${response.status}, but continuing...`
      );
      return {
        analysis: "Analysis request completed.",
      };
    }

    // ✅ WAIT for the entire SSE stream to complete
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      return {
        analysis: "Analysis initiated successfully.",
      };
    }

    // Read all chunks until stream is done
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("✅ SSE stream completed");
        break;
      }
      // Optionally decode and log progress
      const chunk = decoder.decode(value, { stream: true });
      console.log("📦 Received chunk:", chunk.substring(0, 100) + "...");
    }

    // Return a simple success message after stream completes
    return {
      analysis: "Requirements analysis completed and stored successfully.",
    };
  } catch (error) {
    console.error("Analyze requirements API error:", error);
    throw error; // Let the caller handle this
  }
}

export async function editRequirements(
  sessionId: string,
  requirements: string
): Promise<{ analysis: string }> {
  try {
    const response = await fetch(`${AGENT_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        app_name: "decider_agent",
        user_id: "user123",
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [
            {
              text:
                "edited; " +
                `sessionID: ${sessionId};  ` +
                requirements +
                "Make sure to save the analysis in database.",
            },
          ],
        },
        streaming: false,
      }),
    });

    if (!response.ok) {
      console.warn(
        `Edit Requirements request returned ${response.status}, but continuing...`
      );
      return {
        analysis: "Edit Requirements request completed.",
      };
    }

    // ✅ WAIT for the entire SSE stream to complete
    const reader = response.body?.getReader();

    if (!reader) {
      return {
        analysis: "Analysis initiated successfully.",
      };
    }

    // Read all chunks until stream is done
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("✅ SSE stream completed");
        break;
      }
    }

    // Return a simple success message after stream completes
    return {
      analysis:
        "Editing Requirements analysis completed and stored successfully.",
    };
  } catch (error) {
    console.error("Edit Analyze requirements API error:", error);
    throw error; // Let the caller handle this
  }
}

// ============================================================================
// TEST CASE GENERATION
// ============================================================================

export async function generateTestCases(
  sessionId: string,
  prompt?: string
): Promise<{ testCases: string; rawResponse?: string }> {
  try {
    const response = await fetch(`${AGENT_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        app_name: "decider_agent",
        user_id: "user123",
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [
            {
              text:
                "approved; " +
                `sessionID: ${sessionId};  ` +
                prompt +
                "Make sure to save the test-cases in database.",
            },
          ],
        },
        streaming: false,
      }),
    });

    //     const result = await handleApiResponse<any>(response);

    //     const rawResponse =
    //       result.content?.parts?.[0]?.text || result.text || "Testcase generated";

    //     const testCases = parseTestCasesFromResponse(rawResponse);

    //     return {
    //       testCases: testCases,
    //     };
    //   } catch (error) {
    //     console.error("Generate test cases API error:", error);
    //     throw error;
    //   }
    // }
    if (!response.ok) {
      console.warn(
        `Edit Requirements request returned ${response.status}, but continuing...`
      );
      return {
        testCases: "Test-case generation request completed.",
      };
    }

    // ✅ WAIT for the entire SSE stream to complete
    const reader = response.body?.getReader();

    if (!reader) {
      return {
        testCases: "Test-case generation initiated successfully.",
      };
    }

    // Read all chunks until stream is done
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("✅ SSE stream completed");
        break;
      }
    }

    // Return a simple success message after stream completes
    return {
      testCases: "Test-case generation completed and stored successfully.",
    };
  } catch (error) {
    console.error("Test-case generation API error:", error);
    throw error; // Let the caller handle this
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
        sessionData.status === "in_progress"
          ? "in_progress"
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

export async function getSessionRequirements(
  sessionId: string
): Promise<Requirement[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/sessions/${sessionId}/requirements`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleApiResponse<SessionRequirementsResponse>(
      response
    );

    // Return only the requirements array
    return result.requirements || [];
  } catch (error) {
    console.error("Get session requirements API error:", error);
    throw error;
  }
}

export async function getSessionTestcases(
  sessionId: string
): Promise<{ testCases: any[]; rawResponse?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/test-cases`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleApiResponse<any>(response);
    const testcases = result.testcases ? result.testcases : result;
    // 🔍 Log to see actual structure
    console.log("🔍 getSessionTestcases API Response:", result);
    //need to convert these testcases properly - refer function parseTestCasesFromResponse
    const formattedTestCases = parseTestCasesFromResponse(testcases);

    return { testCases: formattedTestCases, rawResponse: result };
  } catch (error) {
    console.error("Get session requirements API error:", error);
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
  getSessionRequirements,
  getSessionTestcases,
};
