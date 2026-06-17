export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created: string;
  timestamp?: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated: string;
}
