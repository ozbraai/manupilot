'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Lock, Unlock, AlertTriangle } from 'lucide-react';
import PromptEditor from '@/components/admin/PromptEditor';

type Prompt = {
    id: string;
    category: string;
    name: string;
    template: string;
    description?: string;
    version: number;
    is_frozen: boolean;
    is_active: boolean;
    token_usage?: any;
    created_at: string;
    updated_at: string;
};

export default function AIRulesPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Editor
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, [activeCategory]);

    async function fetchPrompts() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/ai-prompts?category=${activeCategory}`);
            const data = await res.json();
            if (data.prompts) {
                setPrompts(data.prompts);
            }
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(data: Partial<Prompt>) {
        try {
            const res = await fetch('/api/admin/ai-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                fetchPrompts();
                setIsEditorOpen(false);
                setSelectedPrompt(null);
            }
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    }

    async function handleFreeze(id: string, freeze: boolean) {
        try {
            const res = await fetch('/api/admin/ai-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: freeze ? 'freeze' : 'unfreeze' }),
            });

            if (res.ok) {
                fetchPrompts();
            }
        } catch (error) {
            console.error('Freeze failed:', error);
            alert('Failed to update freeze status');
        }
    }

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = ['all', 'wizard', 'playbook', 'components', 'cost_estimation', 'compliance', 'matching', 'qc'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Rules</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage AI prompt templates and behavior.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedPrompt(null);
                        setIsEditorOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Prompt
                </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-semibold">Caution: AI prompts control core platform behavior.</p>
                    <p className="mt-1">Changes may affect user experience. Test thoroughly before deploying. Use freeze to protect critical prompts.</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`${activeCategory === cat
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Prompts List */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredPrompts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No prompts found. Click "New Prompt" to create one.
                                    </td>
                                </tr>
                            ) : (
                                filteredPrompts.map((prompt) => (
                                    <tr key={prompt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 font-mono">{prompt.name}</div>
                                            {prompt.description && (
                                                <div className="text-xs text-gray-500 mt-1">{prompt.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                                                {prompt.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">v{prompt.version}</td>
                                        <td className="px-6 py-4">
                                            {prompt.is_frozen ? (
                                                <span className="flex items-center gap-1 text-xs text-amber-700">
                                                    <Lock className="w-3 h-3" />
                                                    Frozen
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-green-700">
                                                    <Unlock className="w-3 h-3" />
                                                    Editable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(prompt.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPrompt(prompt);
                                                        setIsEditorOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleFreeze(prompt.id, !prompt.is_frozen)}
                                                    className={prompt.is_frozen ? 'text-green-600 hover:text-green-900' : 'text-amber-600 hover:text-amber-900'}
                                                    title={prompt.is_frozen ? 'Unfreeze' : 'Freeze'}
                                                >
                                                    {prompt.is_frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editor */}
            <PromptEditor
                prompt={selectedPrompt}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setSelectedPrompt(null);
                }}
                onSave={handleSave}
            />
        </div>
    );
}
