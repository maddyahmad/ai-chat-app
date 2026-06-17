import { create } from "zustand";
import type { RecordModel } from "pocketbase";
import { pb } from "../lib/pocketbase";
import { initAuth, login, logout } from "../lib/pocketbaseAuth";
import { useChatStore } from "./chatStore";
import { useConversationsStore } from "./conversationsStore";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthStore {
  status: AuthStatus;
  user: RecordModel | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

function syncFromPbAuth() {
  if (pb.authStore.isValid && pb.authStore.record) {
    return {
      status: "authenticated" as const,
      user: pb.authStore.record,
    };
  }

  return {
    status: "unauthenticated" as const,
    user: null,
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "loading",
  user: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    set({ status: "loading" });

    pb.authStore.onChange(() => {
      const next = syncFromPbAuth();
      set(next);

      if (next.status === "unauthenticated") {
        useConversationsStore.getState().reset();
        useChatStore.getState().reset();
      }
    });

    await initAuth();
    set({ ...syncFromPbAuth(), initialized: true });
  },

  signIn: async (email, password) => {
    try {
      await login(email, password);
      set(syncFromPbAuth());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      throw new Error(message);
    }
  },

  signUp: async (email, password) => {
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
      });

      await login(email, password);
      set(syncFromPbAuth());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      throw new Error(message);
    }
  },

  signOut: async () => {
    await logout();
    useConversationsStore.getState().reset();
    useChatStore.getState().reset();
    set(syncFromPbAuth());
  },
}));
