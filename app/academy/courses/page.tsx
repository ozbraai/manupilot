export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Learning
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Deep-dive courses on building physical products.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            From sourcing in China to building local supply chains in Australia, our upcoming
            courses bring together real case studies and practical frameworks.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
           Planned
          </div>
          <p className="text-slate-600">
            Courses will be available as standalone purchases and included in future Pro plans —
            perfect for founders who want to go deeper.
          </p>
        </div>
      </section>
    </main>
  );
}