const AUTH_KEY = "pb_auth";

declare global {
  interface Window {
    electronAPI?: {
      saveAuth: (data: unknown) => Promise<void>;
      loadAuth: () => Promise<unknown>;
      clearAuth: () => Promise<void>;
    };
  }
}

function useElectronStorage() {
  return typeof window !== "undefined" && !!window.electronAPI;
}

export async function saveAuth(data: unknown) {
  if (useElectronStorage()) {
    await window.electronAPI!.saveAuth(data);
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export async function loadAuth() {
  if (useElectronStorage()) {
    return window.electronAPI!.loadAuth();
  }

  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearAuth() {
  if (useElectronStorage()) {
    await window.electronAPI!.clearAuth();
    return;
  }

  localStorage.removeItem(AUTH_KEY);
}
