import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value]);

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus-within:border-primary-400 dark:focus-within:border-primary-500 transition-colors duration-150 shadow-sm">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message AI Assistant... (Enter to send, Shift+Enter for new line)"
                        disabled={disabled}
                        rows={1}
                        className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-1.5 max-h-40 min-h-[2rem] leading-relaxed disabled:opacity-50"
                    />
                    <div className="flex items-center gap-1 pb-0.5">
                        <button
                            type="button"
                            aria-label="Voice input"
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150"
                        >
                            <Mic size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!value.trim() || disabled}
                            aria-label="Send message"
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-500 shadow-sm"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
                    AI Assistant may produce inaccurate information. Use with discretion.
                </p>
            </div>
        </div>
    );
}
