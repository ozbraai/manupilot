'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AgentProfile = {
  id: string;
  full_name: string | null;
  role: string | null;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);

  useEffect(() => {
    async function loadAgents() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent');

      setAgents(data || []);
    }

    loadAgents();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 pt-16">
      <h1 className="text-3xl font-semibold mb-8">Manufacturing Agents</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-5 border rounded-xl shadow-sm hover:shadow-md"
          >
            <h2 className="font-medium text-lg">
              {agent.full_name || 'Unnamed agent'}
            </h2>
            <p className="text-sm text-slate-600">
              Role: {agent.role || 'agent'}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              ManuPilot Agent (placeholder profile)
            </p>
          </div>
        ))}

        {agents.length === 0 && <p>No agents yet.</p>}
      </div>
    </main>
  );
}