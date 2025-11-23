'use client';

import PartnersPage from '@/components/partners/PartnersPage';

export default function ShippingPartnersPage() {
  return (
    <PartnersPage
      type="shipper"
      basePath="shipping-partners"
      title="Shipping Partners"
      description="Connect with freight forwarders and logistics experts to move your goods from factory to warehouse."
      emptyMessage="No shipping partners match your current filters."
    />
  );
}