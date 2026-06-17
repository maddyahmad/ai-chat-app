import { create } from "zustand";
import type { RecordModel } from "pocketbase";
import { pb } from "../lib/pocketbase";
import type { Conversation } from "../types";

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface ConversationsStore {
  status: LoadStatus;
  items: Conversation[];
  error: string | null;
  load: () => Promise<void>;
  create: (title: string) => Promise<Conversation | null>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  touch: (id: string) => Promise<void>;
  reset: () => void;
}

function toConversation(record: RecordModel): Conversation {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    created_at: record.created,
    updated: record.updated,
  };
}

export const useConversationsStore = create<ConversationsStore>((set) => ({
  status: "idle",
  items: [],
  error: null,

  load: async () => {
    const userId = pb.authStore.record?.id;
    if (!userId) {
      set({ status: "error", error: "Not authenticated", items: [] });
      return;
    }

    set({ status: "loading", error: null });

    try {
      const result = await pb.collection("conversations").getList(1, 50, {
        filter: `user_id = "${userId}"`,
        sort: "-updated",
      });

      set({
        status: "ready",
        items: result.items.map(toConversation),
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load conversations";
      set({ status: "error", error: message, items: [] });
    }
  },

  create: async (title) => {
    const userId = pb.authStore.record?.id;
    if (!userId) return null;

    try {
      const data = await pb.collection("conversations").create({
        title,
        user_id: userId,
        updated: new Date().toISOString(),
      });

      const conversation = toConversation(data);

      set((state) => ({
        status: "ready",
        items: [conversation, ...state.items],
        error: null,
      }));

      return conversation;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create conversation";
      set({ error: message });
      return null;
    }
  },

  rename: async (id, title) => {
    await pb.collection("conversations").update(id, {
      title,
      updated: new Date().toISOString(),
    });

    set((state) => ({
      items: state.items.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  remove: async (id) => {
    await pb.collection("conversations").delete(id);

    set((state) => ({
      items: state.items.filter((c) => c.id !== id),
    }));
  },

  touch: async (id) => {
    const ts = new Date().toISOString();

    await pb.collection("conversations").update(id, { updated: ts });

    set((state) => ({
      items: [...state.items]
        .map((c) => (c.id === id ? { ...c, updated: ts } : c))
        .sort(
          (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime(),
        ),
    }));
  },

  reset: () => {
    set({ status: "idle", items: [], error: null });
  },
}));
