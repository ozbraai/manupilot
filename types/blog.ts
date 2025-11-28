export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    excerpt?: string | null;
    content_markdown: string;
    cover_image_url?: string | null;
    status: "draft" | "published";
    seo_title?: string | null;
    seo_description?: string | null;
    seo_keywords?: string[] | null;
    canonical_url?: string | null;
    og_image_url?: string | null;
    read_time_minutes?: number | null;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    author_id: string;
}

export interface BlogComment {
    id: string;
    post_id: string;
    author_id?: string | null;
    author_name?: string | null;
    author_email?: string | null;
    body: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    updated_at: string;
}
