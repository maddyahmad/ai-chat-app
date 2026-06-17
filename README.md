# AI Chat App

A desktop-ready chat application built with React, TypeScript, and PocketBase. Users can sign in, manage conversations in a sidebar, and exchange messages that persist across restarts.

## Features

- **Authentication** — email/password sign up and sign in via PocketBase
- **Persistent sessions** — stay logged in across page refreshes and app restarts; invalid tokens trigger a clean logout
- **Conversation sidebar** — create, rename, delete, and switch between conversations
- **Message history** — messages are stored in PocketBase and reload after restart
- **Mock AI replies** — canned responses for local development (real API hook point included)
- **Dark mode** — theme toggle with system-aware styling
- **Responsive layout** — collapsible sidebar on mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript, Tailwind CSS |
| Build | Vite |
| State | Zustand (focused stores: auth, conversations, chat) |
| Backend | [PocketBase](https://pocketbase.io/) |
| Desktop (optional) | Electron with encrypted auth storage |

## Prerequisites

- Node.js 18+
- [PocketBase](https://pocketbase.io/docs/) running locally (default: `http://127.0.0.1:8090`)

## PocketBase Setup

Create three collections in the PocketBase admin UI (`/_/`).

### `users` (auth collection)

Use the built-in auth collection. Enable email/password authentication.

### `conversations`

| Field | Type | Notes |
|-------|------|-------|
| `title` | Text | Conversation title |
| `user_id` | Relation → `users` | Single, required |
| `updated` | Date | Last activity timestamp |

**API rules**

| Rule | Expression |
|------|------------|
| List/Search | `user_id = @request.auth.id` |
| View | `user_id = @request.auth.id` |
| Create | `@request.auth.id != ""` |
| Update | `user_id = @request.auth.id` |
| Delete | `user_id = @request.auth.id` |

### `messages`

| Field | Type | Notes |
|-------|------|-------|
| `conversation_id` | Relation → `conversations` | Single, required |
| `user_id` | Relation → `users` | Single, required |
| `text` | Text | Message role: `"user"` or `"assistant"` |
| `content` | Editor | Message body |

**API rules**

| Rule | Expression |
|------|------------|
| List/Search | `user_id = @request.auth.id` |
| View | `user_id = @request.auth.id` |
| Create | `user_id = @request.auth.id` |
| Update | `user_id = @request.auth.id` |
| Delete | `user_id = @request.auth.id` |

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Local development
VITE_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090

# Production (example — use your deployed PocketBase URL)
# VITE_PUBLIC_POCKETBASE_URL=https://pb.yourdomain.com
```

> **Important:** `VITE_*` variables are embedded at **build time**. After changing them on Vercel, trigger a new deployment.

## Getting Started

```bash
# Install dependencies
npm install

# Start PocketBase (in a separate terminal)
./pocketbase serve

# Start the dev server
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Other scripts

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Project Structure

```
src/
├── features/
│   ├── auth/          # Login / signup UI
│   ├── chat/          # Chat area, input, message bubbles
│   └── ui/            # Sidebar, theme toggle, shared UI
├── lib/
│   ├── pocketbase.ts      # PocketBase client
│   ├── pocketbaseAuth.ts  # Login, logout, token refresh
│   ├── authStorage.ts     # Persist auth (localStorage / Electron)
│   └── messageUtils.ts    # PocketBase ↔ app message mapping
├── stores/
│   ├── authStore.ts           # Auth session state
│   ├── conversationsStore.ts  # Sidebar conversations CRUD
│   └── chatStore.ts           # Active chat, messages, send
├── services/
│   └── mockAi.ts      # Mock AI responses for development
├── App.tsx
└── main.tsx

electron/              # Optional desktop shell
├── main.js            # Encrypted auth storage via IPC
└── preload.js
```

## State Management

State is split into three Zustand stores instead of one monolithic store:

- **`authStore`** — session status, user record, sign in/up/out, startup token validation
- **`conversationsStore`** — conversation list and sidebar actions (create, rename, delete)
- **`chatStore`** — active conversation, loaded messages, send state; persists `activeId` across refreshes

Conversations and messages are always loaded from PocketBase after authentication. The PocketBase auth token is persisted separately so the user remains logged in across restarts.

## Auth Persistence

| Runtime | Storage |
|---------|---------|
| Browser (`npm run dev`) | `localStorage` |
| Electron | Encrypted file via `safeStorage` |

On startup the app restores the saved token, calls `authRefresh()` to validate it, and logs out cleanly if the token is expired or invalid.

## AI Integration

Responses currently come from `src/services/mockAi.ts` (random canned replies with a short delay). To connect a real backend, replace the mock call in `src/stores/chatStore.ts` with your API endpoint:

```ts
const res = await fetch("/api/ai-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: content.trim() }),
});
const json = await res.json();
```

## Electron (Optional)

The `electron/` folder contains a minimal desktop wrapper with encrypted credential storage. Electron is included as a dependency but is not wired into `npm run dev` by default — the app runs as a Vite web app during development.

To use Electron, build the frontend first (`npm run build`) and launch the Electron main process pointed at the built output or dev server URL.

## Deploying (Vercel + PocketBase)

### You do NOT need your own domain

Hosts give you a free HTTPS URL automatically, for example:

| Service | Example URL |
|---------|-------------|
| [PocketHost](https://pockethost.io) | `https://my-chat-app.pockethost.io` |
| [Railway](https://railway.com) | `https://pocketbase-production-xxxx.up.railway.app` |
| [Fly.io](https://fly.io) | `https://my-pocketbase.fly.dev` |

Use that URL as `VITE_PUBLIC_POCKETBASE_URL` on Vercel.

---

### Why `127.0.0.1` fails on Vercel

If you see:

```
blocked by CORS policy: Permission was denied for this request to access the `loopback` address space
```

your Vercel site is trying to reach **localhost on the visitor's PC**, not your server. That cannot work in production.

---

### Recommended: PocketHost (easiest, no domain)

Best if you want a public URL in a few minutes without DevOps.

1. Go to [pockethost.io](https://pockethost.io) and create an account.
2. **Create instance** — pick a subdomain, e.g. `my-chat-app` → URL becomes `https://my-chat-app.pockethost.io`.
3. Open the admin UI at `https://my-chat-app.pockethost.io/_/` and set up your superuser.
4. Recreate your collections (`users`, `conversations`, `messages`) and API rules from the [PocketBase Setup](#pocketbase-setup) section above.

   **Or migrate from local:** in your local PocketBase admin → **Settings** → **Backups** → create backup, then restore it on the hosted instance.

5. In hosted PocketBase → **Settings** → **Application** → **Allowed origins**, add:

   ```
   https://ai-chat-app-pi-ecru.vercel.app
   ```

6. In **Vercel** → Settings → Environment Variables:

   | Name | Value |
   |------|-------|
   | `VITE_PUBLIC_POCKETBASE_URL` | `https://my-chat-app.pockethost.io` |

7. **Redeploy** the Vercel project (required — Vite bakes env vars at build time).

---

### Alternative: Railway (one-click template)

1. Open [Railway PocketBase template](https://railway.com/deploy/pocketbase).
2. Deploy — Railway assigns a public `*.up.railway.app` URL with HTTPS.
3. Attach a **persistent volume** so your database survives restarts.
4. Configure collections, allowed origins, and the Vercel env var as above.

---

### Alternative: Fly.io (self-host, more technical)

Follow the [official Fly.io guide](https://github.com/pocketbase/pocketbase/discussions/537). You get a `*.fly.dev` URL. Requires a Dockerfile, volume, and `flyctl` CLI.

---

### Quick test only: Cloudflare Tunnel (keep local PocketBase)

If you just want to **test** Vercel against your local PocketBase temporarily:

```bash
# Install cloudflared, then:
cloudflared tunnel --url http://127.0.0.1:8090
```

It prints a temporary `https://xxxx.trycloudflare.com` URL. Put that in Vercel env vars and redeploy.

> Not for production — the URL changes and your PC must stay online.

---

### Vercel checklist

1. PocketBase is on a **public HTTPS URL** (not `127.0.0.1`).
2. `VITE_PUBLIC_POCKETBASE_URL` is set on Vercel to that URL.
3. Vercel app is **redeployed** after changing the variable.
4. PocketBase **allowed origins** includes your Vercel URL.
5. DevTools → Network shows requests going to the public PocketBase host.

### Local vs production

| Environment | `VITE_PUBLIC_POCKETBASE_URL` |
|-------------|------------------------------|
| Local dev | `http://127.0.0.1:8090` |
| Vercel / production | `https://my-chat-app.pockethost.io` (or Railway/Fly URL) |

## License

Private project.
