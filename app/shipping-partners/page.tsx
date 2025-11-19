export default function ShippingPartnersPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Marketplace
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Shipping & logistics partners.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            A central place to connect with freight forwarders and shipping experts — and link
            them directly to your ManuPilot projects and timelines.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
            Coming soon
          </div>
          <p className="text-slate-600">
            In the next phase, you&apos;ll be able to compare options, understand sea vs air trade-offs,
            and track containers directly from your ManuPilot project view.
          </p>
        </div>
      </section>
    </main>
  );
}