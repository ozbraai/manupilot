'use client';

import { dummyAgents } from '@/lib/dummyAgents';

export default function AgentsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-8 text-slate-900">Manufacturing Agents</h1>

      <p className="text-slate-600 mb-10 max-w-2xl">
        These are experienced sourcing agents, manufacturing partners, and local operators
        who can help you turn your idea into a factory-ready product. Later this page will show
        verified profiles from your ManuPilot marketplace.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyAgents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-2xl border border-slate-200 shadow-sm bg-white hover:shadow-xl transition p-5"
          >
            <img
              src={agent.avatar}
              alt={agent.name}
              className="h-20 w-20 rounded-full object-cover mb-4"
            />

            <h2 className="text-lg font-semibold text-slate-900">{agent.name}</h2>
            <p className="text-sm mt-1 text-slate-500">{agent.country}</p>

            <div className="mt-3 flex gap-2 flex-wrap">
              {agent.specialties.map((spec) => (
                <span
                  key={spec}
                  className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-700 leading-relaxed">
              {agent.bio}
            </div>

            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-amber-600">
              ⭐️ {agent.rating.toFixed(1)}
              <span className="text-slate-400 text-xs">(rating)</span>
            </div>

            <button className="mt-6 w-full py-2 text-sm rounded-full bg-sky-600 text-white hover:bg-sky-500 transition">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}