import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
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
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations for this user
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
      *,
      customer:customer_id(id, email),
      partner:partner_id(id, email),
      project:projects(id, title),
      last_message:messages(content, created_at, sender_id)
    `)
        .or(`customer_id.eq.${user.id},partner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
        (conversations || []).map(async (conv) => {
            const isCustomer = conv.customer_id === user.id;
            const readField = isCustomer ? 'read_by_customer' : 'read_by_partner';

            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq(readField, false)
                .neq('sender_id', user.id);

            return {
                ...conv,
                unread_count: count || 0,
                other_user: isCustomer ? conv.partner : conv.customer,
            };
        })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
}

export async function POST(request: Request) {
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
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { partnerId, projectId, rfqId, subject } = body;

    if (!partnerId) {
        return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    // Check if conversation already exists
    let query = supabase
        .from('conversations')
        .select('*')
        .or(`and(customer_id.eq.${user.id},partner_id.eq.${partnerId}),and(customer_id.eq.${partnerId},partner_id.eq.${user.id})`);

    if (projectId) query = query.eq('project_id', projectId);
    if (rfqId) query = query.eq('rfq_id', rfqId);

    const { data: existing } = await query.maybeSingle();

    if (existing) {
        return NextResponse.json({ conversation: existing });
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
            customer_id: user.id,
            partner_id: partnerId,
            project_id: projectId,
            rfq_id: rfqId,
            subject: subject || 'New Conversation',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation });
}
