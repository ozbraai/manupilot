'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Partner } from '@/components/partners/PartnerCard';

type ContactInfo = {
    email?: string;
    website?: string;
    phone?: string;
    wechat?: string;
};

type PartnerProfileProps = {
    id: string;
    type: 'manufacturer' | 'agent' | 'shipper' | string;
};

export default function PartnerProfile({ id, type }: PartnerProfileProps) {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [contactInfo, setContactInfo] = useState<ContactInfo>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New Features State
    const [photos, setPhotos] = useState<string[]>([]);
    const [showMap, setShowMap] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                if (!id) return;
                setLoading(true);
                setError(null);

                // Try to fetch from Supabase
                const { data, error: dbError } = await supabase
                    .from('partners')
                    .select('*')
                    .eq('id', id)
                    .eq('type', type)
                    .single();

                if (dbError) {
                    // Fallback for demo purposes if not found in DB (since we might not have agents/shippers data yet)
                    console.warn('Partner load error, using fallback if applicable:', dbError);
                    if (type === 'agent' || type === 'shipper') {
                        // Mock data for demo
                        const mockPartner: any = {
                            id,
                            name: type === 'agent' ? 'Global Sourcing Agents Ltd' : 'FastTrack Logistics',
                            type,
                            region: 'Guangdong',
                            country: 'China',
                            rating: 4.8,
                            description: type === 'agent' ? 'Expert sourcing agents for electronics and consumer goods.' : 'Reliable shipping partner for air and sea freight.',
                            capabilities: type === 'agent' ? ['Sourcing', 'QC', 'Negotiation'] : ['Air Freight', 'Sea Freight', 'Customs Clearance'],
                            contact_info: { email: 'contact@example.com', website: 'https://example.com' },
                            image_url: ''
                        };
                        setPartner(mockPartner);
                        setContactInfo(mockPartner.contact_info);
                        setLoading(false);
                        return;
                    }

                    setError('Could not load partner.');
                    return;
                }

                setPartner(data as Partner);

                const ci = (data as any).contact_info || {};
                if (ci && typeof ci === 'object') {
                    setContactInfo(ci as ContactInfo);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, type]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">Loading profile...</p>
            </main>
        );
    }

    if (error || !partner) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    {error || 'Partner not found.'}
                </p>
            </main>
        );
    }

    const caps = partner.capabilities || [];
    const location = partner.region || partner.country || 'Region not specified';

    const rating = partner.rating ?? 0;
    const ratingLabel =
        rating > 0 ? `${rating.toFixed(1)} / 5` : 'Not rated yet';

    const hasContact =
        contactInfo.email || contactInfo.website || contactInfo.phone || contactInfo.wechat;

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-5xl mx-auto pt-12 px-4 md:px-0 space-y-8">

                {/* === HEADER CARD === */}
                <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start gap-6">
                    {/* Logo / Avatar */}
                    {partner.image_url ? (
                        <div className="h-24 w-24 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={partner.image_url}
                                alt={partner.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl shrink-0 border border-slate-100">
                            {type === 'manufacturer' ? '🏭' : type === 'agent' ? '🕵️' : '🚢'}
                        </div>
                    )}

                    <div className="flex-1 space-y-2">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900">{partner.name}</h1>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                                    {type}
                                </span>
                            </div>
                            <p className="text-slate-500 flex items-center gap-1 mt-1">
                                <span>📍</span> {location}
                            </p>
                        </div>

                        {rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-400 text-sm">
                                    {'★'.repeat(Math.round(rating))}
                                    <span className="text-slate-200">{'★'.repeat(5 - Math.round(rating))}</span>
                                </div>
                                <span className="text-sm text-slate-600 font-medium">
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={async () => {
                                const res = await fetch('/api/messages/conversations', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        partnerId: (partner as any).user_id || partner.id,
                                        subject: `Inquiry about ${partner.name}`
                                    }),
                                });
                                if (res.ok) {
                                    window.location.href = '/messages';
                                }
                            }}
                            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            💬 Send Message
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* === LEFT COLUMN (Main Info) === */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* OVERVIEW */}
                        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {partner.description || 'No overview has been provided yet.'}
                            </p>

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Capabilities</h3>
                                {caps.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {caps.map((cap, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
                                            >
                                                {cap}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No capabilities specified yet.</p>
                                )}
                            </div>
                        </section>

                        {/* PHOTO GALLERY (New Feature) */}
                        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Gallery</h2>
                                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                                    + Add Photos
                                </button>
                            </div>

                            {photos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {photos.map((photo, idx) => (
                                        <div key={idx} className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                            <img src={photo} alt="Business" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                                    <div className="text-4xl mb-2">📷</div>
                                    <p className="text-sm text-slate-500 font-medium">No photos uploaded yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Showcase your facilities, products, or team.</p>
                                    <button className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        Upload Photos
                                    </button>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* === RIGHT COLUMN (Sidebar) === */}
                    <div className="space-y-6">

                        {/* MAP (New Feature) */}
                        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-900">Location</h3>
                                <span className="text-xs text-slate-500">{location}</span>
                            </div>
                            <div className="h-48 bg-slate-100 relative group">
                                {/* Placeholder Map */}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                                    <span className="text-2xl">🗺️</span>
                                </div>
                                {/* Overlay for interactivity */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="bg-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                                        View on Google Maps
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 text-xs text-slate-500">
                                <p>123 Industrial Park Road</p>
                                <p>{location}</p>
                            </div>
                        </section>

                        {/* CONTACT INFO */}
                        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4">Contact Details</h3>

                            {hasContact ? (
                                <div className="space-y-3 text-sm">
                                    {contactInfo.email && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">✉️</span>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-slate-500">Email</p>
                                                <a href={`mailto:${contactInfo.email}`} className="text-slate-900 font-medium hover:text-indigo-600 truncate block">
                                                    {contactInfo.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {contactInfo.website && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">🌐</span>
                                            <div>
                                                <p className="text-xs text-slate-500">Website</p>
                                                <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-medium hover:text-indigo-600">
                                                    Visit Website
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {contactInfo.phone && (
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">📞</span>
                                            <div>
                                                <p className="text-xs text-slate-500">Phone</p>
                                                <p className="text-slate-900 font-medium">{contactInfo.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No contact details available.</p>
                            )}
                        </section>

                    </div>
                </div>

            </div>
        </main>
    );
}
