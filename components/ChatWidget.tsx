'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'bot'; text: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    // send message to our API
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-sky-600 text-white h-14 w-14 shadow-xl flex items-center justify-center text-2xl hover:bg-sky-500 transition"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="font-medium text-slate-700">ManuBot</div>
            <button
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white ml-auto'
                    : 'bg-slate-100 text-slate-800 mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-slate-100 text-slate-500 p-2 rounded-lg max-w-[70%] animate-pulse mr-auto">
                ManuBot is typing…
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ask ManuBot anything…"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-500 transition"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}