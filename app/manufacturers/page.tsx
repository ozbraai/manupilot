// app/manufacturers/page.tsx

'use client';

import PartnersPage from '@/components/partners/PartnersPage';

export default function ManufacturersPage() {
  return (
    <PartnersPage
      type="manufacturer"
      basePath="manufacturers"
      title="Manufacturers"
      description="Browse vetted manufacturers by capability. Filter by material, process, region, rating or product type to find partners that fit your ManuPilot projects."
      emptyMessage="No manufacturers match your current filters."
    />
  );
}