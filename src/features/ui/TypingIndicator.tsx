import { Bot } from 'lucide-react';

export function TypingIndicator() {
    return (
        <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={15} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5 h-5">
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse-dot-1" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse-dot-2" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse-dot-3" />
                </div>
            </div>
        </div>
    );
}
