'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Conversation = {
    id: string;
    subject: string;
    unread_count: number;
    last_message_at: string;
    other_user: {
        id: string;
        email: string;
    };
    project?: {
        title: string;
    };
};

export default function MessagesPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);

            // Subscribe to new messages
            const channel = supabase
                .channel(`messages:${selectedConversation}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedConversation}`,
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                    scrollToBottom();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedConversation]);

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    }

    async function loadConversations() {
        setLoading(true);
        const res = await fetch('/api/messages/conversations');
        const data = await res.json();
        setConversations(data.conversations || []);
        setLoading(false);
    }

    async function loadMessages(conversationId: string) {
        const res = await fetch(`/api/messages/${conversationId}`);
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
    }

    async function sendMessage() {
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        await fetch(`/api/messages/${selectedConversation}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newMessage.trim() }),
        });

        setNewMessage('');
        loadMessages(selectedConversation);
        loadConversations(); // Refresh to update unread counts
        setSending(false);
    }

    function scrollToBottom() {
        const container = document.getElementById('messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Loading messages...</p>
            </div>
        );
    }

    return (
        <main className="h-screen flex overflow-hidden bg-slate-50">

            {/* Conversation List */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No conversations yet
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold' : 'font-medium'} text-slate-900`}>
                                                    {conv.other_user?.email}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.project && (
                                                <p className="text-xs text-slate-500 mt-0.5">{conv.project.title}</p>
                                            )}
                                            {conv.last_message_at && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(conv.last_message_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation View */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Messages */}
                        <div id="messages-container" className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg) => {
                                const isMine = msg.sender_id === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md px-4 py-2 rounded-2xl ${isMine
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-slate-200 text-slate-900'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="flex gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                                    className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-500">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </main>
    );
}
