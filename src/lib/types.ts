export interface Message {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  created_at: string;
  chat_id: string;
}

export interface Chat {
  id: string;
  title: string;
  session_id: string;
  last_message?: string;
  updated_at: string;
}

export interface Session {
  id: string;
  project_name: string;
  status:
    | "in_progress"
    | "rag_context_loaded"
    | "requirements_analyzed"
    | "test_cases_generated"
    | "completed";
  alm_tool?: string;
  created_at: string;
  updated_at?: string;
}

// Backend API Response Types

export interface CreateSessionResponse {
  session_id: string;
  user_id: string;
  project_name: string;
  status: string;
  message: string;
  database_saved: boolean;
}

export interface FetchRAGResponse {
  session_id: string;
  status: string;
  prompt: string;
  rag_enabled: boolean;
  rag_items_count: number;
  context_scope: string;
  from_cache: boolean;
  cache_key: string;
  cache_performance: string;
  message: string;
  database_saved: boolean;
}

export interface AnalyzeRequirementsResponse {
  session_id: string;
  status: string;
  analysis_depth: string;
  original_input_count: number;
  analyzed_requirements_count: number;
  requirements: {
    status: string;
    response: string;
    agent_used: string;
    requirements_count: number;
  };
  agent_used: string;
  message: string;
}

export interface Requirement {
  id: string;
  session_id: string;
  original_content: string;
  edited_content: string | null;
  requirement_type: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive" | "archived" | "draft";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SessionRequirementsResponse {
  session_id: string;
  requirements: Requirement[];
  total_count: number;
}

export interface GenerateTestCasesResponse {
  session_id: string;
  status: string;
  test_types_requested: string[];
  generated_test_cases_count: number;
  test_cases: string;
  agent_used: string;
  message: string;
}

export interface UploadDocumentResponse {
  status: string;
  document_id: string;
  file_type: string;
  original_filename: string;
  processing_result: {
    status: string;
    document_id: string;
    chunks_created: number;
    content: string[];
    metadata: {
      document_id: string;
      source_type: string;
      source_path: string;
      file_size: number;
    };
    processing_info: {
      file_type: string;
      original_filename: string;
      file_size: number;
    };
  };
  content: string[];
  rag_ingestion: {
    status: string;
    rag_chunks_created: number;
    sample_chunks: string[];
    ingestion_result: {
      status: string;
      datapoints_added: number;
      doc_id: string;
    };
    vector_store_type: string;
  };
  components: {
    document_processing: string;
    rag_ingestion: string;
  };
  message: string;
}

export interface UserSessions {
  user_id: string;
  sessions: {
    session_id: string;
    user_id: string;
    project_name: string;
    status: string;
    created_at: string;
    updated_at: string;
    requirements_count: number;
    edited_requirements_count: number;
    test_cases_count: number;
    requirement_test_links_count: number;
  }[];
  total_count: number;
}

export interface TestCase {
  id: string;
  session_id?: string;
  test_name: string;
  test_description?: string;
  test_steps?: string[]; // Array of steps for clarity
  expected_results?: string; // Expected outcomes
  test_type?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  status?: "Draft" | "In Progress" | "Completed" | "Blocked";
  created_at?: string; // ISO Date String
  updated_at?: string; // ISO Date String
  requirement_traceability?: string; // Link or ID reference
  summary?: string;
  test_data?: Record<string, any>; // Flexible data structure
  preconditions?: string;
  postconditions?: string;
  estimated_duration?: number; // in minutes
  automation_feasible?: boolean;
  tags?: string[];
}

export const sampleTestCases: TestCase[] = [
  {
    id: "TC001",
    session_id: "S001",
    test_name: "Verify Patient Registration Form Submission",
    test_description:
      "Ensure that the patient registration form successfully submits when all required fields are filled correctly.",
    test_steps: [
      "Open the registration form",
      "Enter valid patient details",
      "Click on Submit button",
    ],
    expected_results:
      "Form should be submitted successfully and a confirmation message should appear.",
    test_type: "Functional",
    priority: "High",
    status: "Completed",
    created_at: "2025-11-07T09:00:00Z",
    updated_at: "2025-11-07T09:45:00Z",
    requirement_traceability: "REQ-PR-001",
    summary: "Valid registration test for new patients",
    test_data: {
      name: "John Doe",
      age: 35,
      contact: "9876543210",
    },
    preconditions: "User should be on the registration page.",
    postconditions: "Patient record should be created in the database.",
    estimated_duration: 10,
    automation_feasible: true,
    tags: ["registration", "form", "frontend"],
  },
  {
    id: "TC002",
    session_id: "S001",
    test_name: "Check Appointment Scheduling with Invalid Date",
    test_description:
      "Verify that the system prevents users from scheduling an appointment for a past date.",
    test_steps: [
      "Go to appointment booking page",
      "Select a past date",
      "Click on Confirm button",
    ],
    expected_results:
      "System should display an error message indicating invalid date.",
    test_type: "Validation",
    priority: "Medium",
    status: "In Progress",
    created_at: "2025-11-06T10:00:00Z",
    updated_at: "2025-11-07T08:00:00Z",
    requirement_traceability: "REQ-APPT-002",
    summary: "Appointment booking validation for past date.",
    test_data: {
      appointment_date: "2024-12-25",
      patient_id: "P12345",
    },
    preconditions: "User must be logged in.",
    postconditions: "No appointment should be created.",
    estimated_duration: 8,
    automation_feasible: true,
    tags: ["appointment", "validation"],
  },
  {
    id: "TC003",
    session_id: "S002",
    test_name: "Validate Doctor Login Functionality",
    test_description:
      "Ensure that doctors can log in with valid credentials and are redirected to their dashboard.",
    test_steps: [
      "Open the doctor login page",
      "Enter valid credentials",
      "Click on Login",
    ],
    expected_results: "Doctor should be redirected to dashboard successfully.",
    test_type: "Functional",
    priority: "High",
    status: "Draft",
    created_at: "2025-11-05T14:30:00Z",
    updated_at: "2025-11-07T10:15:00Z",
    requirement_traceability: "REQ-DR-LOGIN-003",
    summary: "Login flow validation for doctor portal.",
    test_data: {
      username: "dr.smith",
      password: "secure@123",
    },
    preconditions: "Doctor account should exist in the system.",
    postconditions: "User should land on the dashboard with personalized data.",
    estimated_duration: 6,
    automation_feasible: true,
    tags: ["doctor", "login", "authentication"],
  },
  {
    id: "TC004",
    session_id: "S003",
    test_name: "Verify EMR Data Upload Functionality",
    test_description:
      "Check that users can upload valid EMR files and receive success confirmation.",
    test_steps: [
      "Navigate to EMR upload section",
      "Click Upload and select valid file",
      "Submit and verify confirmation",
    ],
    expected_results:
      "File should upload successfully and confirmation should display.",
    test_type: "Integration",
    priority: "Critical",
    status: "Completed",
    created_at: "2025-11-07T07:00:00Z",
    updated_at: "2025-11-07T09:10:00Z",
    requirement_traceability: "REQ-EMR-004",
    summary: "Ensures EMR upload and storage integration.",
    test_data: {
      file_name: "patient_emr_001.pdf",
      file_size_kb: 256,
    },
    preconditions: "User must have access to EMR upload section.",
    postconditions: "EMR file should be stored in patient’s record.",
    estimated_duration: 12,
    automation_feasible: false,
    tags: ["emr", "upload", "file"],
  },
  {
    id: "TC005",
    session_id: "S004",
    test_name: "Validate Search Functionality in Doctor Portal",
    test_description:
      "Ensure doctors can search patients using name or ID in the dashboard search bar.",
    test_steps: [
      "Login as doctor",
      "Go to dashboard search bar",
      "Enter patient name or ID and hit Search",
    ],
    expected_results:
      "Relevant patient records should be displayed with correct details.",
    test_type: "Functional",
    priority: "Medium",
    status: "In Progress",
    created_at: "2025-11-07T06:00:00Z",
    updated_at: "2025-11-07T08:45:00Z",
    requirement_traceability: "REQ-DR-SEARCH-005",
    summary: "Patient search validation for doctors.",
    test_data: {
      patient_name: "Mary Jane",
      patient_id: "P78910",
    },
    preconditions: "Doctor should be logged in with valid credentials.",
    postconditions: "Matching records should be visible on screen.",
    estimated_duration: 9,
    automation_feasible: true,
    tags: ["search", "doctor", "dashboard"],
  },
];
