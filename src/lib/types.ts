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
  status: "active" | "completed" | "draft";
  created_at: string;
}
