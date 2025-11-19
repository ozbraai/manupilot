export default function LegalServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb3">
            Marketplace
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Legal & IP partners you can actually talk to.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            From NDAs and trademarks to patent strategy, ManuPilot will connect you with lawyers
            who understand hardware, consumer products and manufacturing.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
            Coming soon
          </div>
          <p className="text-slate-600">
            This directory will launch with curated IP specialists and practical guidance — so you
            can protect what matters without getting lost in legal jargon.
          </p>
        </div>
      </section>
    </main>
  );
}