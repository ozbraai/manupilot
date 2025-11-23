'use client';

import PartnersPage from '@/components/partners/PartnersPage';

export default function AgentsPage() {
  return (
    <PartnersPage
      type="agent"
      basePath="agents"
      title="Sourcing Agents"
      description="Find expert sourcing agents to help you negotiate, inspect, and manage production on the ground."
      emptyMessage="No agents match your current filters."
    />
  );
}