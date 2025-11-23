'use client';

import { useParams } from 'next/navigation';
import PartnerProfile from '@/components/partners/PartnerProfile';

export default function ManufacturerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  return <PartnerProfile id={id} type="manufacturer" />;
}