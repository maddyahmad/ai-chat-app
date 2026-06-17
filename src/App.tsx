import { useState, useEffect, useCallback } from 'react';
import { Loader2, Menu, X } from 'lucide-react';
import { useTheme } from './features/ui/useTheme';
import { useAuthStore } from './stores/authStore';
import { useConversationsStore } from './stores/conversationsStore';
import { useChatStore } from './stores/chatStore';
import { Sidebar } from './features/ui/Sidebar';
import { ChatArea } from './features/chat/ChatArea';
import { ThemeToggle } from './features/ui/ThemeToggle';
import { AuthPage } from './features/auth/AuthPage';

export default function App() {
  const { isDark, toggle } = useTheme();

  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const initialize = useAuthStore((s) => s.initialize);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);

  const conversations = useConversationsStore((s) => s.items);
  const convStatus = useConversationsStore((s) => s.status);
  const loadConversations = useConversationsStore((s) => s.load);
  const createConversation = useConversationsStore((s) => s.create);
  const renameConversation = useConversationsStore((s) => s.rename);
  const deleteConversation = useConversationsStore((s) => s.remove);
  const touchConversation = useConversationsStore((s) => s.touch);

  const activeId = useChatStore((s) => s.activeId);
  const chatHydrated = useChatStore((s) => s.hydrated);
  const msgStatus = useChatStore((s) => s.status);
  const msgError = useChatStore((s) => s.error);
  const messages = useChatStore((s) => s.messages);
  const isSending = useChatStore((s) => s.isSending);
  const sendError = useChatStore((s) => s.sendError);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearSendError = useChatStore((s) => s.clearSendError);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !chatHydrated) return;

    (async () => {
      await loadConversations();

      const persistedActiveId = useChatStore.getState().activeId;
      if (!persistedActiveId) return;

      const exists = useConversationsStore
        .getState()
        .items.some((c) => c.id === persistedActiveId);

      if (exists) {
        await setActiveConversation(persistedActiveId);
      } else {
        await setActiveConversation(null);
      }
    })();
  }, [authStatus, chatHydrated, loadConversations, setActiveConversation]);

  const handleNew = useCallback(async () => {
    const conv = await createConversation('New Conversation');
    if (conv) await setActiveConversation(conv.id);
    setSidebarOpen(false);
  }, [createConversation, setActiveConversation]);

  const handleSelect = useCallback(
    async (id: string) => {
      await setActiveConversation(id);
      setSidebarOpen(false);
    },
    [setActiveConversation],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      if (activeId === id) await setActiveConversation(null);
    },
    [deleteConversation, activeId, setActiveConversation],
  );

  const handleSend = useCallback(
    async (content: string) => {
      let targetId = activeId;
      if (!targetId) {
        const words = content.trim().split(/\s+/).slice(0, 5).join(' ');
        const title = words.length < content.trim().length ? `${words}…` : words;
        const conv = await createConversation(title);
        if (!conv) return;
        targetId = conv.id;
        await setActiveConversation(targetId);
      }
      await sendMessage(content, () => touchConversation(targetId!), targetId!);
    },
    [activeId, createConversation, sendMessage, touchConversation, setActiveConversation],
  );

  if (authStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={28} className="animate-spin text-primary-400" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <AuthPage
        onSignIn={signIn}
        onSignUp={signUp}
        isDark={isDark}
        onToggleTheme={toggle}
      />
    );
  }

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      <header className="shrink-0 h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 bg-white dark:bg-gray-900 z-10">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle sidebar"
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="flex-1" />
        <ThemeToggle isDark={isDark} onToggle={toggle} />
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <button
            className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
            md:relative md:flex md:translate-x-0
            fixed top-14 left-0 bottom-0 z-30
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar
            conversations={convStatus === 'ready' ? conversations : []}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={handleDelete}
            onRename={renameConversation}
            userEmail={user?.email ?? ''}
            onSignOut={signOut}
          />
        </div>

        <ChatArea
          conversation={activeConversation}
          messages={messages}
          msgStatus={msgStatus}
          msgError={msgError ?? undefined}
          isSending={isSending}
          sendError={sendError}
          onClearSendError={clearSendError}
          onSend={handleSend}
          onNew={handleNew}
        />
      </div>
    </div>
  );
}
