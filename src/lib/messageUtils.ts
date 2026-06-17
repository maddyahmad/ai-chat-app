import type { RecordModel } from "pocketbase";
import type { Message } from "../types";

export function toMessage(record: RecordModel): Message {
  return {
    id: record.id,
    conversation_id: record.conversation_id,
    user_id: record.user_id,
    role: record.text === "assistant" ? "assistant" : "user",
    content: record.content ?? "",
    created: record.created,
    timestamp: new Date(record.created),
  };
}

export function toPbMessage(
  conversationId: string,
  userId: string,
  role: Message["role"],
  content: string,
) {
  return {
    conversation_id: conversationId,
    user_id: userId,
    text: role,
    content,
  };
}
