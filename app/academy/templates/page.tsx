export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Learning
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Templates to replace your spreadsheets.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            RFQ emails, NDA templates, costing sheets, QC checklists — all designed for founders
            who build real products, not software.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
            Coming soon
          </div>
          <p className="text-slate-600">
            We&apos;re turning the most useful internal documents from years of manufacturing into
            clean, reusable templates you can drop into your own workflow.
          </p>
        </div>
      </section>
    </main>
  );
}