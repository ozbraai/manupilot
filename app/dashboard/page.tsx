'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Project = {
  id: string;
  title: string;
  description: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email);

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setProjects(data || []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-20">
        <p>Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pt-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">
          Welcome{email ? `, ${email}` : ''}
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-full border border-slate-300 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>

      <Link
        href="/projects/new"
        className="inline-block mb-6 px-6 py-3 bg-sky-600 text-white rounded-full"
      >
        Create Project
      </Link>

      <h2 className="text-xl font-medium mb-4">My Projects</h2>

      {projects.length === 0 && <p>No projects yet.</p>}

      <div className="space-y-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block p-4 border rounded-lg hover:bg-slate-100"
          >
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-sm text-slate-600">
              {p.description || 'No description yet.'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}