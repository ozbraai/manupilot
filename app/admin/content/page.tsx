'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Archive, Trash2 } from 'lucide-react';
import ContentEditor from '@/components/admin/ContentEditor';

type Content = {
    id: string;
    type: 'educational' | 'template' | 'label';
    category: string;
    title: string;
    slug?: string;
    body?: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
};

export default function ContentPage() {
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'educational' | 'template' | 'label'>('educational');
    const [searchQuery, setSearchQuery] = useState('');

    // Editor
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/content?type=${activeTab}`);
            const data = await res.json();
            if (data.content) {
                setContent(data.content);
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(data: Partial<Content>) {
        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                fetchContent();
                setIsEditorOpen(false);
                setSelectedContent(null);
            }
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to archive this content?')) return;

        try {
            const res = await fetch(`/api/admin/content?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchContent();
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to archive content');
        }
    }

    const filteredContent = content.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage educational content, templates, and system labels.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedContent(null);
                        setIsEditorOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Content
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['educational', 'template', 'label'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
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
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredContent.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No content found. Click "Add Content" to create your first entry.
                                    </td>
                                </tr>
                            ) : (
                                filteredContent.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                            {item.slug && <div className="text-xs text-gray-500">/{item.slug}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedContent(item);
                                                        setIsEditorOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Archive className="w-4 h-4" />
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
            <ContentEditor
                content={selectedContent}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setSelectedContent(null);
                }}
                onSave={handleSave}
            />
        </div>
    );
}
