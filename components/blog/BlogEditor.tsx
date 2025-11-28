'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogPost } from '@/types/blog';
import {
    Save,
    Image as ImageIcon,
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Eye,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface BlogEditorProps {
    post?: BlogPost;
    isNew?: boolean;
}

export default function BlogEditor({ post, isNew = false }: BlogEditorProps) {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    const [previewMode, setPreviewMode] = useState(false);

    // Form state
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [subtitle, setSubtitle] = useState(post?.subtitle || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content_markdown || '');
    const [coverImage, setCoverImage] = useState(post?.cover_image_url || '');
    const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
    const [publishedAt, setPublishedAt] = useState(post?.published_at || '');

    // SEO state
    const [seoTitle, setSeoTitle] = useState(post?.seo_title || '');
    const [seoDescription, setSeoDescription] = useState(post?.seo_description || '');
    const [seoKeywords, setSeoKeywords] = useState(post?.seo_keywords?.join(', ') || '');
    const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url || '');
    const [ogImage, setOgImage] = useState(post?.og_image_url || '');

    // Auto-generate slug from title only when title loses focus and slug is empty (or if user explicitly asks)
    const generateSlug = () => {
        if (title && !slug) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setLoading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('blog-media')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('blog-media').getPublicUrl(filePath);
            setCoverImage(data.publicUrl);
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !slug || !content) {
            alert('Title, Slug, and Content are required.');
            return;
        }

        setLoading(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');

            const readTime = Math.ceil(content.split(/\s+/).length / 200);

            const postData: Partial<BlogPost> = {
                title,
                slug,
                subtitle: subtitle || null,
                excerpt: excerpt || null,
                content_markdown: content,
                cover_image_url: coverImage || null,
                status,
                seo_title: seoTitle || null,
                seo_description: seoDescription || null,
                seo_keywords: seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : null,
                canonical_url: canonicalUrl || null,
                og_image_url: ogImage || null,
                read_time_minutes: readTime,
                updated_at: new Date().toISOString(),
            };

            if (status === 'published' && !publishedAt) {
                postData.published_at = new Date().toISOString();
            } else if (publishedAt) {
                postData.published_at = publishedAt;
            }

            if (isNew) {
                postData.author_id = user.id;
                const { error } = await supabase.from('blog_posts').insert([postData]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', post!.id);
                if (error) throw error;
            }

            router.push('/admin/content/blogs');
            router.refresh();
        } catch (error: any) {
            console.error('Error saving post:', error);
            alert(`Error saving post: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const insertText = (before: string, after: string = '') => {
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const beforeText = text.substring(0, start);
        const selectedText = text.substring(start, end);
        const afterText = text.substring(end);

        const newText = beforeText + before + selectedText + after + afterText;
        setContent(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/content/blogs" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isNew ? 'New Blog Post' : 'Edit Blog Post'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors
                            ${previewMode
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {previewMode ? 'Edit Mode' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Slug */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={generateSlug}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                                placeholder="Enter post title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    /blog/
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="post-slug"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Optional subtitle"
                            />
                        </div>
                    </div>

                    {/* Editor / Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        {!previewMode && (
                            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center gap-2 sticky top-0 z-10">
                                <button onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-gray-200 rounded" title="Bold"><Bold className="w-4 h-4" /></button>
                                <button onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-gray-200 rounded" title="Italic"><Italic className="w-4 h-4" /></button>
                                <div className="w-px h-4 bg-gray-300 mx-1" />
                                <button onClick={() => insertText('# ')} className="p-1.5 hover:bg-gray-200 rounded font-bold text-xs" title="Heading 1">H1</button>
                                <button onClick={() => insertText('## ')} className="p-1.5 hover:bg-gray-200 rounded font-bold text-xs" title="Heading 2">H2</button>
                                <div className="w-px h-4 bg-gray-300 mx-1" />
                                <button onClick={() => insertText('- ')} className="p-1.5 hover:bg-gray-200 rounded" title="Bullet List"><List className="w-4 h-4" /></button>
                                <button onClick={() => insertText('1. ')} className="p-1.5 hover:bg-gray-200 rounded" title="Ordered List"><ListOrdered className="w-4 h-4" /></button>
                                <div className="w-px h-4 bg-gray-300 mx-1" />
                                <button onClick={() => insertText('[', '](url)')} className="p-1.5 hover:bg-gray-200 rounded" title="Link"><LinkIcon className="w-4 h-4" /></button>
                                <button onClick={() => insertText('![alt](', ')')} className="p-1.5 hover:bg-gray-200 rounded" title="Image"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        )}

                        {previewMode ? (
                            <div className="p-8 prose prose-lg max-w-none flex-1 overflow-y-auto bg-white">
                                <h1 className="mb-4">{title}</h1>
                                {subtitle && <p className="lead text-xl text-gray-500 mb-8">{subtitle}</p>}
                                {coverImage && (
                                    <div className="mb-8 rounded-lg overflow-hidden aspect-video relative">
                                        <img src={coverImage} alt="Cover" className="object-cover w-full h-full" />
                                    </div>
                                )}
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                id="content-editor"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 w-full p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                                placeholder="Write your post content here (Markdown supported)..."
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Meta */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Publishing</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        {status === 'published' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Published At</label>
                                <input
                                    type="datetime-local"
                                    value={publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setPublishedAt(new Date(e.target.value).toISOString())}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Cover Image</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                "
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-sm text-gray-500">or URL</span>
                            </div>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        {coverImage && (
                            <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={coverImage} alt="Cover" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">Excerpt</h3>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Short summary..."
                        />
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-medium text-gray-900 border-b pb-2">SEO Settings</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder={title}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                            <textarea
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder={excerpt}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keywords</label>
                            <input
                                type="text"
                                value={seoKeywords}
                                onChange={(e) => setSeoKeywords(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Comma separated..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
