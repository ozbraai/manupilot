import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import CommentSection from '@/components/blog/CommentSection';

// Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .single();

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        openGraph: {
            title: post.seo_title || post.title,
            description: post.seo_description || post.excerpt || undefined,
            type: 'article',
            url: post.canonical_url || undefined,
            images: post.og_image_url || post.cover_image_url ? [post.og_image_url || post.cover_image_url] : undefined,
        },
        alternates: {
            canonical: post.canonical_url,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .single();

    if (!post) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen py-12 sm:py-16">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Blog
                    </Link>
                </div>

                <article>
                    <header className="flex flex-col items-start gap-4 mb-10">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <time dateTime={post.published_at || ''} className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                            </time>
                            {post.read_time_minutes && (
                                <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {post.read_time_minutes} min read
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {post.title}
                        </h1>
                        {post.subtitle && (
                            <p className="text-xl text-gray-500">
                                {post.subtitle}
                            </p>
                        )}
                    </header>

                    {post.cover_image_url && (
                        <div className="mb-10 rounded-2xl overflow-hidden bg-gray-100 aspect-video relative">
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    <div className="prose prose-lg prose-blue mx-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content_markdown}
                        </ReactMarkdown>
                    </div>

                    {/* Tags / Keywords */}
                    {post.seo_keywords && post.seo_keywords.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {post.seo_keywords.map((keyword: string) => (
                                    <span key={keyword} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Comments Section */}
                <div className="mt-16 pt-10 border-t border-gray-200">
                    <CommentSection postId={post.id} />
                </div>
            </div>
        </div>
    );
}
