'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { BlogComment } from '@/types/blog';
import { User } from 'lucide-react';
import Link from 'next/link';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [commentBody, setCommentBody] = useState('');
    const [user, setUser] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchComments();
        checkUser();
    }, [postId]);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }

    async function fetchComments() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_comments')
                .select('*')
                .eq('post_id', postId)
                .eq('status', 'approved')
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) {
                setComments(data as BlogComment[]);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        if (!commentBody.trim()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const newComment: Partial<BlogComment> = {
                post_id: postId,
                author_id: user.id,
                author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
                author_email: user.email,
                body: commentBody,
                status: 'pending'
            };

            const { error } = await supabase
                .from('blog_comments')
                .insert([newComment]);

            if (error) throw error;

            setCommentBody('');
            setMessage({ type: 'success', text: 'Thanks! Your comment is awaiting moderation.' });
        } catch (error: any) {
            console.error('Error submitting comment:', error);
            setMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Comment List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-gray-500 text-sm">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg px-4 py-3">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-medium text-gray-900">{comment.author_name}</span>
                                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{comment.body}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a comment</h3>
                {user ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="comment" className="sr-only">Comment</label>
                            <textarea
                                id="comment"
                                rows={4}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                placeholder="Share your thoughts..."
                                value={commentBody}
                                onChange={(e) => setCommentBody(e.target.value)}
                                required
                            />
                        </div>
                        {message && (
                            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !commentBody.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600 mb-4">Please sign in to leave a comment.</p>
                        <Link
                            href="/account/login?next=/blog"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
