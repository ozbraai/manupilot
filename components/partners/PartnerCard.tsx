// components/partners/PartnerCard.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// === [1] TYPES ===
export type Partner = {
  id: string;
  user_id?: string; // Added for messaging
  type: string;
  name: string;
  region: string | null;
  country?: string | null;
  description: string | null;
  capabilities?: string[] | null;
  rating?: number | null;
  image_url?: string | null;
};

type PartnerCardProps = {
  partner: Partner;
  basePath: string;
};

// === [2] COMPONENT ROOT ===
export default function PartnerCard({ partner, basePath }: PartnerCardProps) {
  const router = useRouter();
  const rating = partner.rating ?? 0;
  const capabilities = partner.capabilities || [];

  async function handleMessage(e: React.MouseEvent) {
    e.stopPropagation();
    // Ensure the partner has a linked user account (partner profile)
    if (!partner.user_id) {
      alert('Please complete your Manufacturer profile first (save your profile) before messaging.');
      return;
    }
    const res = await fetch('/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: partner.user_id || partner.id,
        subject: `Inquiry about ${partner.name}`,
        initialMessage: `Hi, I'm interested in your services.`
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.conversation?.id) {
        router.push(`/messages?id=${data.conversation.id}`);
      } else {
        router.push('/messages');
      }
    } else {
      const err = await res.json();
      console.error('Failed to create conversation:', err);
      alert(`Error: ${err.error || 'Failed to start conversation'}`);
    }
  }

  return (
    <div
      onClick={() => router.push(`/${basePath}/${partner.id}`)}
      className="group relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/30 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Header with Image and Name */}
        <div className="flex items-start gap-4 mb-4">
          {partner.image_url ? (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-zinc-100 group-hover:ring-blue-200 transition-all">
              <img
                src={partner.image_url}
                alt={partner.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
              🏭
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
              {partner.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{partner.region || partner.country || 'Global'}</span>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-amber-400 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-current' : 'fill-zinc-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-medium text-zinc-600">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {partner.description && (
          <p className="text-sm text-zinc-600 leading-relaxed mb-4 line-clamp-2">
            {partner.description}
          </p>
        )}

        {/* Capabilities */}
        {capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {capabilities.slice(0, 4).map((cap, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors"
              >
                {cap}
              </span>
            ))}
            {capabilities.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500">
                +{capabilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-100">
          <button
            onClick={handleMessage}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-zinc-900 text-zinc-900 rounded-lg hover:bg-zinc-900 hover:text-white active:scale-95 transition-all text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
          <Link
            href={`/${basePath}/${partner.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-zinc-200 text-zinc-700 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 transition-all text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}