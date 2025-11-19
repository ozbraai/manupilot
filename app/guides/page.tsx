export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Learning
          </p>
          <h1 className="text-3xl md:4xl font-semibold mb-4">
            Quick guides for modern manufacturing.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Short, practical reads on the topics you actually care about — from &ldquo;How to brief
            a factory&rdquo; to &ldquo;What to know before you ship your first container&rdquo;.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600 mb-4">
            Content in progress
          </div>
          <p className="text-slate-600">
            We&apos;re curating the first set of guides based on real questions from founders and
            operators building physical products today.
          </p>
        </div>
      </section>
    </main>
  );
}