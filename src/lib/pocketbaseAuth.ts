import type { RecordModel } from "pocketbase";
import { pb } from "./pocketbase";
import { saveAuth, loadAuth, clearAuth } from "./authStorage";

type SavedAuth = {
  token: string;
  model?: RecordModel;
  record?: RecordModel;
};

async function persistAuth() {
  if (!pb.authStore.isValid || !pb.authStore.token || !pb.authStore.record) {
    return;
  }

  await saveAuth({
    token: pb.authStore.token,
    model: pb.authStore.record,
    record: pb.authStore.record,
  });
}

export async function initAuth() {
  const saved = (await loadAuth()) as SavedAuth | null;
  const record = saved?.record ?? saved?.model;

  if (saved?.token && record) {
    pb.authStore.save(saved.token, record);
  }

  if (pb.authStore.isValid) {
    try {
      await pb.collection("users").authRefresh();
      await persistAuth();
    } catch {
      pb.authStore.clear();
      await clearAuth();
    }
    return;
  }

  pb.authStore.clear();
  await clearAuth();
}

export async function login(email: string, password: string) {
  const res = await pb.collection("users").authWithPassword(email, password);
  await persistAuth();
  return res;
}

export async function logout() {
  pb.authStore.clear();
  await clearAuth();
}
