import { useState } from 'react';
import { Bot, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';


interface AuthPageProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
    isDark: boolean;
    onToggleTheme: () => void;
}

function friendlyError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
    if (msg.includes('User already registered')) return 'An account with this email already exists. Please sign in.';
    if (msg.includes('Password should be')) return 'Password must be at least 6 characters.';
    if (msg.includes('Unable to validate') || msg.includes('network') || msg.includes('fetch'))
        return 'Cannot reach the server. Check your connection and try again.';
    if (msg.includes('Email not confirmed')) return 'Please check your email and confirm your account.';
    return msg;
}

export function AuthPage({ onSignIn, onSignUp, isDark, onToggleTheme }: AuthPageProps) {
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const switchTab = (t: 'login' | 'signup') => {
        setTab(t);
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            if (tab === 'login') {
                await onSignIn(email.trim(), password);
            } else {
                await onSignUp(email.trim(), password);
                setSuccess('Account created! You are now signed in.');
            }
        } catch (err: unknown) {
            setError(friendlyError((err as Error).message ?? 'Something went wrong.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* Top bar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 tracking-tight">AI Assistant</span>
                </div>
                <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            </header>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {tab === 'login' ? 'Welcome back' : 'Create an account'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tab === 'login' ? 'Sign in to continue to AI Assistant' : 'Start your AI conversation journey'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                        {(['login', 'signup'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => switchTab(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${tab === t
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {t === 'login' ? 'Sign in' : 'Sign up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="auth-email">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    id="auth-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-colors duration-150"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="auth-password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    id="auth-password"
                                    type={showPw ? 'text' : 'password'}
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-colors duration-150"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 animate-fade-in">
                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 animate-fade-in">
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white text-sm font-medium transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading && <Loader2 size={15} className="animate-spin" />}
                            {tab === 'login' ? 'Sign in' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                        >
                            {tab === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
