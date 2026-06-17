import { useEffect, useRef } from 'react';
import { Sparkles, AlertCircle, Loader2, X } from 'lucide-react';
import { TypingIndicator } from '../ui/TypingIndicator';
import { ChatInput } from './ChatInput';
import type { Conversation, Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
    conversation: Conversation | null;
    messages: Message[];
    msgStatus: 'idle' | 'loading' | 'ready' | 'error';
    msgError?: string;
    isSending: boolean;
    sendError: string | null;
    onClearSendError: () => void;
    onSend: (message: string) => void;
    onNew: () => void;
}

const SUGGESTIONS = [
    'Explain how machine learning works',
    'Help me write a professional email',
    'What are best practices for React?',
    'Summarise the key principles of design',
];

export function ChatArea({
    conversation,
    messages,
    msgStatus,
    msgError,
    isSending,
    sendError,
    onClearSendError,
    onSend,
    onNew,
}: ChatAreaProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    const isEmpty = !conversation || messages.length === 0;

    return (
        <div className="flex-1 flex flex-col h-full min-w-0 bg-gray-50 dark:bg-gray-950">
            {/* Title bar */}
            {conversation && (
                <div className="shrink-0 h-11 flex items-center px-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{conversation.title}</h2>
                </div>
            )}

            {/* Body */}
            {!conversation ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 dark:bg-primary-400/10 flex items-center justify-center mb-5">
                        <Sparkles size={26} className="text-primary-500 dark:text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">How can I help you today?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                        Ask me anything — questions, ideas, writing, code, analysis, and more.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => onSend(s)}
                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-left text-xs text-gray-600 dark:text-gray-300 transition-all duration-150 shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : msgStatus === 'loading' ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-gray-400 dark:text-gray-500" />
                </div>
            ) : msgStatus === 'error' ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <AlertCircle size={28} className="text-red-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{msgError ?? 'Failed to load messages.'}</p>
                    <button onClick={onNew} className="text-sm text-primary-500 hover:underline">Start a new conversation</button>
                </div>
            ) : isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 dark:bg-primary-400/10 flex items-center justify-center mb-5">
                        <Sparkles size={26} className="text-primary-500 dark:text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Start the conversation</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                        Send a message below to kick things off.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-md w-full mt-8">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => onSend(s)}
                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-left text-xs text-gray-600 dark:text-gray-300 transition-all duration-150 shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-3xl mx-auto space-y-5">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {isSending && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>
                </div>
            )}

            {/* Send error banner */}
            {sendError && (
                <div className="mx-4 mb-2">
                    <div className="max-w-3xl mx-auto flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 animate-fade-in">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span className="flex-1">{sendError}</span>
                        <button onClick={onClearSendError} className="shrink-0 hover:text-red-600 transition-colors">
                            <X size={13} />
                        </button>
                    </div>
                </div>
            )}

            <ChatInput onSend={onSend} disabled={isSending || msgStatus === 'loading'} />
        </div>
    );
}
