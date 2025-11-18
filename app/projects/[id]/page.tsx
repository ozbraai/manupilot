'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  title: string;
  description: string | null;
};

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      setProject(data);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 pt-20">
        <p>Loading project…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="max-w-2xl mx-auto px-6 pt-20">
        <p>Project not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pt-20">
      <h1 className="text-3xl font-semibold mb-4">{project.title}</h1>
      <p className="text-slate-700">{project.description}</p>
    </main>
  );
}