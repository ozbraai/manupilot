'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    // get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('You must be logged in to create a project.');
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(`/projects/${data.id}`);
  }

  return (
    <main className="max-w-md mx-auto px-6 pt-20">
      <h1 className="text-2xl font-semibold mb-6">Create Project</h1>

      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Project title"
          className="w-full border p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Short description"
          className="w-full border p-3 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-3 bg-sky-600 text-white rounded font-medium"
        >
          Save Project
        </button>

        {message && <p className="text-sm mt-2 text-red-600">{message}</p>}
      </form>
    </main>
  );
}