import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BlogPost } from '@/types/blog';
import { Calendar, Clock } from 'lucide-react';

export const metadata = {
    title: 'Blog - ManuPilot',
    description: 'Latest news and updates from ManuPilot.',
};

export default async function BlogIndexPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: allPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    const featuredPost = allPosts && allPosts.length > 0 ? allPosts[0] : null;
    const posts = allPosts && allPosts.length > 1 ? allPosts.slice(1) : [];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
                        The Manufacturing Blog
                    </h1>
                    <p className="text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                        Insights, guides, and updates to help you build better products.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                {/* Featured Post */}
                {featuredPost && (
                    <div className="mb-16">
                        <Link href={`/blog/${featuredPost.slug}`} className="group relative isolate flex flex-col gap-8 lg:flex-row lg:items-center bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow ring-1 ring-slate-200">
                            <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-1/2 lg:shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                {featuredPost.cover_image_url ? (
                                    <img
                                        src={featuredPost.cover_image_url}
                                        alt={featuredPost.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">
                                        <span className="text-4xl">📝</span>
                                    </div>
                                )}
                            </div>
                            <div className="lg:w-1/2 lg:pl-8">
                                <div className="flex items-center gap-x-4 text-xs font-medium text-slate-500 mb-4">
                                    <time dateTime={featuredPost.published_at || ''} className="flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
                                    </time>
                                    {featuredPost.read_time_minutes && (
                                        <span className="flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                                            {featuredPost.read_time_minutes} min read
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4 group-hover:text-sky-600 transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-lg leading-relaxed text-slate-600 mb-6 line-clamp-3">
                                    {featuredPost.excerpt || featuredPost.subtitle}
                                </p>
                                <div className="flex items-center text-sm font-semibold text-sky-600">
                                    Read article <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Post Grid */}
                <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {posts.map((post: BlogPost) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="flex flex-col group">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 mb-5">
                                {post.cover_image_url ? (
                                    <img
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-x-4 text-xs text-slate-500 mb-3">
                                <time dateTime={post.published_at || ''}>
                                    {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
                                </time>
                                {post.read_time_minutes && (
                                    <span>· {post.read_time_minutes} min read</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-sky-600 transition-colors mb-2">
                                {post.title}
                            </h3>
                            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                                {post.excerpt || post.subtitle}
                            </p>
                        </Link>
                    ))}
                </div>

                {(!allPosts || allPosts.length === 0) && (
                    <div className="text-center py-24">
                        <p className="text-slate-500 text-lg">No posts found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
