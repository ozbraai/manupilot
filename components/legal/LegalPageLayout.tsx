import React from 'react';

type LegalPageLayoutProps = {
    title: string;
    lastUpdated?: string;
    children: React.ReactNode;
};

export default function LegalPageLayout({
    title,
    lastUpdated,
    children,
}: LegalPageLayoutProps) {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* HERO */}
            <section className="bg-white border-b border-slate-200 py-16 md:py-20">
                <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        {title}
                    </h1>
                    {lastUpdated && (
                        <p className="text-sm text-slate-500">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>
            </section>

            {/* CONTENT */}
            <section className="max-w-3xl mx-auto px-6 md:px-8 py-12">
                <div className="prose prose-slate prose-sm md:prose-base max-w-none">
                    {children}
                </div>
            </section>
        </main>
    );
}
