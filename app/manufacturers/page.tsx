export default function ManufacturersPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Marketplace
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Manufacturers & production partners.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Soon you&apos;ll be able to discover vetted manufacturers across Australia, China,
            Vietnam, India and beyond — with capabilities, MOQs and lead times all in one view.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
            Coming soon
          </div>
          <p className="text-slate-600">
            We&apos;re actively curating manufacturing partners and designing tools to help you
            compare capabilities, pricing and quality at a glance.
          </p>
        </div>
      </section>
    </main>
  );
}