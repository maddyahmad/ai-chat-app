import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pb } from "../lib/pocketbase";
import { toMessage, toPbMessage } from "../lib/messageUtils";
import { getCannedReply } from "../services/mockAi";
import type { Message } from "../types";

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface ChatStore {
  activeId: string | null;
  status: LoadStatus;
  messages: Message[];
  error: string | null;
  isSending: boolean;
  sendError: string | null;
  hydrated: boolean;
  setActiveConversation: (id: string | null) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    content: string,
    onTouch?: () => void,
    overrideId?: string,
  ) => Promise<void>;
  clearSendError: () => void;
  reset: () => void;
}

let loadSeq = 0;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      activeId: null,
      status: "idle",
      messages: [],
      error: null,
      isSending: false,
      sendError: null,
      hydrated: false,

      setActiveConversation: async (id) => {
        set({ activeId: id });

        if (!id) {
          set({ status: "idle", messages: [], error: null, sendError: null });
          return;
        }

        await get().loadMessages(id);
      },

      loadMessages: async (conversationId) => {
        const seq = ++loadSeq;

        set({ status: "loading", error: null, sendError: null });

        try {
          const res = await pb.collection("messages").getList(1, 100, {
            filter: `conversation_id = "${conversationId}"`,
            sort: "created",
          });

          if (seq !== loadSeq) return;

          set({
            status: "ready",
            messages: res.items.map(toMessage),
            error: null,
          });
        } catch (err: unknown) {
          if (seq !== loadSeq) return;

          const message = err instanceof Error ? err.message : "Failed to load messages";
          set({ status: "error", messages: [], error: message });
        }
      },

      sendMessage: async (content, onTouch, overrideId) => {
        const targetConvId = overrideId ?? get().activeId;
        if (!targetConvId || !content.trim()) return;

        const userId = pb.authStore.record?.id;
        if (!userId) return;

        set({ sendError: null });

        const optimisticUser: Message = {
          id: `opt-${Date.now()}`,
          conversation_id: targetConvId,
          user_id: userId,
          role: "user",
          content: content.trim(),
          created: new Date().toISOString(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages:
            state.status === "ready" || state.messages.length > 0
              ? [...state.messages, optimisticUser]
              : [optimisticUser],
          status: "ready",
          isSending: true,
        }));

        onTouch?.();

        try {
          const userRow = await pb.collection("messages").create(
            toPbMessage(targetConvId, userId, "user", content.trim()),
          );

          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === optimisticUser.id ? toMessage(userRow) : m,
            ),
          }));

          const json = await getCannedReply();

          const aiRow = await pb.collection("messages").create(
            toPbMessage(targetConvId, userId, "assistant", json.reply),
          );

          set((state) => ({
            messages: [...state.messages, toMessage(aiRow)],
          }));

          onTouch?.();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to send message";
          set((state) => ({
            sendError: message,
            messages: state.messages.filter((m) => m.id !== optimisticUser.id),
          }));
        } finally {
          set({ isSending: false });
        }
      },

      clearSendError: () => set({ sendError: null }),

      reset: () => {
        loadSeq += 1;
        set({
          activeId: null,
          status: "idle",
          messages: [],
          error: null,
          isSending: false,
          sendError: null,
        });
      },
    }),
    {
      name: "chat-ui",
      partialize: (state) => ({ activeId: state.activeId }),
    },
  ),
);

if (useChatStore.persist.hasHydrated()) {
  useChatStore.setState({ hydrated: true });
} else {
  useChatStore.persist.onFinishHydration(() => {
    useChatStore.setState({ hydrated: true });
  });
}
