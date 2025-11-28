'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import BlogEditor from '@/components/blog/BlogEditor';
import { BlogPost } from '@/types/blog';

export default function EditBlogPostPage() {
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    async function fetchPost() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setPost(data as BlogPost);
            }
        } catch (error) {
            console.error('Failed to fetch post:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading post...</div>;
    }

    if (!post) {
        return <div className="p-12 text-center text-gray-500">Post not found.</div>;
    }

    return <BlogEditor post={post} />;
}
