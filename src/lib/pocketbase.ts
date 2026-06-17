import PocketBase from "pocketbase";

export const pb = new PocketBase(import.meta.env.VITE_PUBLIC_POCKETBASE_URL);
