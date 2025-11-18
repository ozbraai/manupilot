// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full space-y-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            ManuPilot
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Your manufacturing co-pilot for turning product ideas into
            factory-ready reality.
          </h1>
          <p className="text-base md:text-lg text-slate-300">
            Describe your concept in plain language. ManuPilot guides you
            through NDAs, specifications and supplier-ready briefs – without
            the Alibaba chaos.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="rounded-full px-6 py-3 bg-sky-500 text-slate-950 font-medium text-sm md:text-base hover:bg-sky-400 transition">
            Start your first project
          </button>
          <button className="rounded-full px-6 py-3 border border-slate-600 text-slate-200 text-sm md:text-base hover:border-slate-400 transition">
            See how ManuPilot works
          </button>
        </div>

        <section className="grid gap-6 md:grid-cols-3 text-sm md:text-base text-slate-300">
          <div>
            <h2 className="font-medium text-slate-100 mb-1">Protect your idea</h2>
            <p>Begin every project under NDA so you can share details confidently.</p>
          </div>
          <div>
            <h2 className="font-medium text-slate-100 mb-1">Guided by AI</h2>
            <p>
              Smart questions turn rough thoughts into clear, structured product
              requirements.
            </p>
          </div>
          <div>
            <h2 className="font-medium text-slate-100 mb-1">Factory-ready output</h2>
            <p>
              Export supplier-friendly briefs you can use with ManuPilot or your
              chosen manufacturer.
            </p>
          </div>
        </section>

        <footer className="text-xs text-slate-500">
          ManuPilot is in early build. This page proves the engine is running.
        </footer>
      </div>
    </main>
  );
}