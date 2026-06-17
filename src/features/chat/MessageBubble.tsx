import { User, Bot } from 'lucide-react';
import type { Message } from '../../types';

interface MessageBubbleProps {
    message: Message;
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary-100 dark:bg-primary-900/40'
                    }`}
            >
                {isUser ? (
                    <User size={15} />
                ) : (
                    <Bot size={15} className="text-primary-600 dark:text-primary-400" />
                )}
            </div>

            <div className={`max-w-[75%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isUser
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                        }`}
                >
                    {message.content}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {formatTime(message.timestamp ?? new Date(message.created))}
                </span>
            </div>
        </div>
    );
}
