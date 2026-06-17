import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
    return (
        <button
            onClick={onToggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center
        text-gray-500 dark:text-gray-400
        hover:text-gray-700 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-all duration-200 focus:outline-none focus-visible:ring-2
        focus-visible:ring-primary-500"
        >
            <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0) scale(1)' }}
            >
                <Sun size={18} />
            </span>
            <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0.5)' }}
            >
                <Moon size={18} />
            </span>
        </button>
    );
}
