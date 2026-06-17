import { useState, useRef } from 'react';
import { Plus, MessageSquare, Trash2, Bot, Pencil, Check, X } from 'lucide-react';
import type { Conversation } from '../../types';

interface SidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, title: string) => void;
    userEmail: string;
    onSignOut: () => void;
}

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString();
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onRename, userEmail, onSignOut }: SidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const editRef = useRef<HTMLInputElement>(null);

    const startEdit = (conv: Conversation) => {
        setEditingId(conv.id);
        setEditValue(conv.title);
        setTimeout(() => editRef.current?.select(), 30);
    };

    const commitEdit = () => {
        if (editingId && editValue.trim()) {
            onRename(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    return (
        <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            {/* Brand */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm tracking-tight">AI Assistant</span>
                </div>
                <button
                    onClick={onNew}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white text-sm font-medium transition-all duration-150 shadow-sm"
                >
                    <Plus size={16} />
                    New conversation
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                        <MessageSquare size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">No conversations yet</p>
                    </div>
                ) : (
                    <ul className="space-y-0.5">
                        {conversations.map((conv) => (
                            <li key={conv.id}>
                                {editingId === conv.id ? (
                                    <div className="flex items-center gap-1 px-2 py-1.5">
                                        <input
                                            ref={editRef}
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') commitEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                            className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded-lg border border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
                                        />
                                        <button onClick={commitEdit} className="w-6 h-6 flex items-center justify-center rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                                            <Check size={12} />
                                        </button>
                                        <button onClick={cancelEdit} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onSelect(conv.id)}
                                        className={`w-full group flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${activeId === conv.id
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <MessageSquare
                                            size={14}
                                            className={`shrink-0 mt-0.5 ${activeId === conv.id ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate leading-tight">{conv.title}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(conv.updated)}</p>
                                        </div>
                                        <div className="shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(conv); }}
                                                aria-label="Rename"
                                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                                                aria-label="Delete"
                                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-400 transition-all"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {userEmail.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="flex-1 min-w-0 text-xs text-gray-600 dark:text-gray-400 truncate">{userEmail}</span>
                    <button
                        onClick={onSignOut}
                        className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </aside>
    );
}
