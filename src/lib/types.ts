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
