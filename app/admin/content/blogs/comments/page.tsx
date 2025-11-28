'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { BlogComment } from '@/types/blog';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Trash2,
    MessageSquare
} from 'lucide-react';

export default function CommentModerationPage() {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchComments();
    }, [statusFilter]);

    async function fetchComments() {
        try {
            setLoading(true);
            let query = supabase
                .from('blog_comments')
                .select('*, blog_posts(title)')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) {
                setComments(data as any[]); // Type assertion needed for joined data
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(commentId: string, newStatus: 'approved' | 'rejected') {
        setActionLoading(commentId);
        try {
            const { error } = await supabase
                .from('blog_comments')
                .update({ status: newStatus })
                .eq('id', commentId);

            if (error) throw error;

            // Optimistic update
            setComments(comments.map(c => c.id === commentId ? { ...c, status: newStatus } : c));

            // If filtering by status, remove it from list
            if (statusFilter !== 'all' && statusFilter !== newStatus) {
                setComments(comments.filter(c => c.id !== commentId));
            }

        } catch (error) {
            console.error('Failed to update comment status:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDelete(commentId: string) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setActionLoading(commentId);
        try {
            const { error } = await supabase
                .from('blog_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and moderate blog comments.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                                    ${statusFilter === status
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
                        No {statusFilter !== 'all' ? statusFilter : ''} comments found.
                    </div>
                ) : (
                    comments.map((comment: any) => (
                        <div key={comment.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">{comment.author_name}</span>
                                        <span className="text-sm text-gray-500">• {new Date(comment.created_at).toLocaleString()}</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                                            ${comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                comment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {comment.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-3">
                                        on post: <span className="font-medium text-gray-700">{comment.blog_posts?.title}</span>
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap">{comment.body}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {comment.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(comment.id, 'approved')}
                                                disabled={actionLoading === comment.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(comment.id, 'rejected')}
                                                disabled={actionLoading === comment.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                            >
                                                <XCircle className="w-3 h-3 mr-1" /> Reject
                                            </button>
                                        </>
                                    )}
                                    {comment.status !== 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(comment.id, comment.status === 'approved' ? 'rejected' : 'approved')}
                                            disabled={actionLoading === comment.id}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Mark as {comment.status === 'approved' ? 'Rejected' : 'Approved'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={actionLoading === comment.id}
                                        className="text-xs text-gray-400 hover:text-red-600 flex items-center justify-end mt-2"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
