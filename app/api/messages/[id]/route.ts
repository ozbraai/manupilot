import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: conversationId } = await params;

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`customer_id.eq.${user.id},partner_id.eq.${user.id}`)
        .single();

    if (convError || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get all messages
    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
      *,
      sender:sender_id(id, email)
    `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    // Mark messages as read for current user
    const isCustomer = conversation.customer_id === user.id;
    const readField = isCustomer ? 'read_by_customer' : 'read_by_partner';

    await supabase
        .from('messages')
        .update({ [readField]: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

    return NextResponse.json({ messages, conversation });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: conversationId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
        return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    // Verify user is part of this conversation
    const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`customer_id.eq.${user.id},partner_id.eq.${user.id}`)
        .single();

    if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Determine read fields based on sender
    const isCustomer = conversation.customer_id === user.id;

    // Create message
    const { data: message, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content.trim(),
            read_by_customer: isCustomer, // Sender has already "read" their own message
            read_by_partner: !isCustomer,
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
}
