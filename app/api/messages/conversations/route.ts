import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
    try {
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

        // Get current user's partner record if any
        const { data: partnerRecord } = await supabase
            .from('partners')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        let query = supabase
            .from('conversations')
            .select(`
      *,
      partner_record:partner_record_id(id, name, type),
      project:projects(id, title),
      last_message:messages(content, created_at, sender_id)
    `);

        if (partnerRecord) {
            // User is a partner, show conversations where they are customer OR partner OR partner_record owner
            query = query.or(`customer_id.eq.${user.id},partner_id.eq.${user.id},partner_record_id.eq.${partnerRecord.id}`);
        } else {
            // Regular user
            query = query.or(`customer_id.eq.${user.id},partner_id.eq.${user.id}`);
        }

        const { data: conversations, error } = await query.order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
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

                // Determine other user/partner
                let otherUser;
                if (conv.partner_record) {
                    // Conversation with a partner record
                    if (conv.customer_id === user.id) {
                        // I am the customer, talking to the partner
                        otherUser = {
                            id: conv.partner_record.id,
                            email: conv.partner_record.name,
                            name: conv.partner_record.name,
                        };
                    } else {
                        // I am the partner, talking to the customer
                        // Since we can't join auth.users, we'll use a placeholder for now
                        otherUser = {
                            id: conv.customer_id,
                            name: 'Customer',
                            email: 'Customer',
                        };
                    }
                } else {
                    // Conversation with another user (direct)
                    // We removed the joins, so we have to rely on IDs or placeholders
                    const otherId = isCustomer ? conv.partner_id : conv.customer_id;
                    otherUser = {
                        id: otherId,
                        name: isCustomer ? 'Partner' : 'Customer',
                        email: isCustomer ? 'Partner' : 'Customer',
                    };
                }

                return {
                    ...conv,
                    unread_count: count || 0,
                    other_user: otherUser,
                };
            })
        );

        return NextResponse.json({ conversations: conversationsWithUnread });
    } catch (e: any) {
        console.error('Unexpected error in GET conversations:', e);
        return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
    }
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

    // Determine if partnerId is a user ID or a partner record ID
    // First try to fetch a partner record with this ID
    const { data: partnerRecordById, error: prError } = await supabase
        .from('partners')
        .select('user_id')
        .eq('id', partnerId)
        .maybeSingle();

    let isUserPartner: boolean;
    let resolvedPartnerUserId: string;
    let targetPartnerRecordId: string | null = null;

    if (partnerRecordById && partnerRecordById.user_id) {
        // partnerId is a partner record ID, and it has a linked user
        isUserPartner = false;
        resolvedPartnerUserId = partnerRecordById.user_id;
        targetPartnerRecordId = partnerId;
    } else {
        // Assume partnerId is a user ID (could be a partner user without a partner record yet)
        // Or it's a partner record ID without a linked user (which we'll handle later)
        isUserPartner = true;
        resolvedPartnerUserId = partnerId;
        targetPartnerRecordId = null; // No partner record ID if it's a direct user ID
    }

    // Check if conversation already exists
    let query = supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', user.id);

    if (isUserPartner) {
        query = query.eq('partner_id', resolvedPartnerUserId);
    } else {
        query = query.eq('partner_record_id', targetPartnerRecordId);
    }

    if (projectId) query = query.eq('project_id', projectId);
    if (rfqId) query = query.eq('rfq_id', rfqId);

    const { data: existing } = await query.maybeSingle();

    if (existing) {
        return NextResponse.json({ conversation: existing });
    }

    // Create new conversation
    const conversationData: any = {
        customer_id: user.id,
        project_id: projectId,
        rfq_id: rfqId,
        subject: subject || 'New Conversation',
    };

    // Use the resolved partner user ID and optional partner record ID
    conversationData.partner_id = resolvedPartnerUserId;
    if (targetPartnerRecordId) {
        conversationData.partner_record_id = targetPartnerRecordId;
    }

    // Prevent self-messaging
    if (conversationData.customer_id === conversationData.partner_id) {
        return NextResponse.json({ error: 'You cannot message your own partner profile.' }, { status: 400 });
    }

    const { data: conversation, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial message if provided
    if (body.initialMessage) {
        await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: body.initialMessage,
            read_by_customer: true, // Sender is customer (usually)
            read_by_partner: false
        });
    }

    return NextResponse.json({ conversation });
}
