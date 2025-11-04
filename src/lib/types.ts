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
  test_name: string;
  test_description: string;
  test_steps: string[];
  expected_results: string;
  priority: "High" | "Medium" | "Low";
  test_type?: string;
}

export const generatedTestCasesDummyData: TestCase[] = [
  {
    id: "1",
    test_name: "Patient Registration Form Validation",
    test_description:
      "Validate that the patient registration form enforces mandatory fields and displays proper validation messages.",
    test_steps: [
      "Navigate to the patient registration page",
      "Leave 'Name' and 'Contact Number' fields empty and click Submit",
      "Enter invalid email (e.g., 'abc@xyz') and submit again",
      "Fill all fields correctly and click 'Submit'",
    ],
    expected_results:
      "System should show validation errors for missing mandatory fields and prevent form submission. Invalid email format should trigger appropriate error message. Valid form submission should complete successfully with confirmation.",
    priority: "High",
    test_type: "Functional",
  },
  {
    id: "2",
    test_name: "EMR Data Synchronization after Consultation",
    test_description:
      "Ensure that doctor's consultation notes and prescriptions are synced to the patient's EMR in real-time.",
    test_steps: [
      "Login as a doctor and open a patient record",
      "Add consultation notes and a prescription",
      "Save the record",
      "Login as the patient and open EMR records",
    ],
    expected_results:
      "All consultation notes and prescriptions should be immediately visible in the patient's EMR with accurate timestamps and without data loss.",
    priority: "High",
    test_type: "Integration",
  },
  {
    id: "3",
    test_name: "Doctor Portal Appointment Rescheduling",
    test_description:
      "Verify that appointment rescheduling from the doctor's portal reflects accurately for both doctor and patient.",
    test_steps: [
      "Login to the doctor portal and open the appointment list",
      "Select an existing appointment and change the date/time",
      "Save the updated appointment",
      "Login as the patient and verify appointment details",
    ],
    expected_results:
      "Updated appointment date and time should be reflected in both doctor and patient portals with notification sent to patient about the change.",
    priority: "Medium",
    test_type: "Functional",
  },
  {
    id: "4",
    test_name: "Patient Portal Password Reset Functionality",
    test_description:
      "Confirm that a patient can reset their password securely using a registered email address.",
    test_steps: [
      "Go to login page and click 'Forgot Password'",
      "Enter registered email and submit",
      "Open reset link received in email",
      "Enter new password and confirm reset",
    ],
    expected_results:
      "Password reset link should be sent to registered email, link should be valid for limited time, and new password should work for subsequent login attempts.",
    priority: "Low",
    test_type: "Security",
  },
  {
    id: "5",
    test_name: "Mobile Device Compatibility",
    test_description:
      "Check that the patient portal UI and core functionalities work seamlessly on mobile devices.",
    test_steps: [
      "Access patient portal using a mobile browser",
      "Navigate through sections like lab results and medical history",
      "Use filtering and search options on mobile",
      "Download a PDF report from the portal",
    ],
    expected_results:
      "Portal should load with responsive mobile layout, all navigation should be touch-friendly, filters and search should work correctly, and PDF downloads should complete successfully on mobile devices.",
    priority: "Medium",
    test_type: "UI/UX",
  },
];
