export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="max-w-6xl mx-auto px  -6 md:px-10 py-20 md:py-28">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-4">
            About ManuPilot
          </p>
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
                Turning real-world product ideas into reliable, global supply chains.
              </h1>
              <p className="text-lg text-slate-600">
                ManuPilot was created by product builders who learned the hard way how painful
                manufacturing can be. Today, we&apos;re building the operating system that makes
                sourcing, production and shipping feel as simple as booking a ride.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button className="inline-flex items-center rounded-full bg-sky-600 text-white px-6 py-3 text-sm font-medium shadow-[0_12px_30px_rgba(56,189,248,0.35)] hover:bg-sky-500 transition">
                  Meet the platform
                </button>
                <button className="inline-flex items-center rounded-full border border-slate-300 text-slate-800 px-6 py-3 text-sm font-medium hover:bg-slate-100 transition">
                  Our story
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] p-6 md:p-8 space-y-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Built by makers, for makers</h2>
              <p className="text-sm text-slate-600">
                ManuPilot started as a spreadsheet on a kitchen table. After wrestling with
                factories, freight, and quality issues while building our own physical products,
                we realised the tools we needed didn&apos;t exist — so we built them.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Years building</p>
                  <p className="text-xl font-semibold mt-1">10+</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Products shipped</p>
                  <p className="text-xl font-semibold mt-1">250k+</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Countries</p>
                  <p className="text-xl font-semibold mt-1">20+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR MISSION */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-[1.1fr_1.2fr] items-start">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                Mission
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Give every founder a world-class supply chain — without the guesswork.
              </h2>
              <p className="text-slate-600">
                Manufacturing has always been opaque and relationship-driven. The tools are
                spreadsheets, email threads, and late-night WeChat calls. We&apos;re changing that by
                combining real-world experience with AI, so anyone can move from concept to
                production with clarity and confidence.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Built for doers</p>
                <p className="text-sm text-slate-700">
                  ManuPilot is designed for founders, operators and product teams who are juggling
                  real-world constraints — cash flow, timelines, quality and customer expectations.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Powered by AI</p>
                <p className="text-sm text-slate-700">
                  Our co-pilot helps you write specs, compare quotes, understand trade-offs and
                  stay ahead of risks — always with your context in mind.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Globally minded</p>
                <p className="text-sm text-slate-700">
                  From local Australian makers to factories in China, India or Vietnam, we help you
                  pick the right path for your product, not just the cheapest.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Transparent by default</p>
                <p className="text-sm text-slate-700">
                  Clear timelines, transparent costs and a single source of truth so your whole
                  team — and your partners — stay aligned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERS STRIP */}
      <section className="bg-slate-900 text-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid gap-10 md:grid-cols-4 text-center md:text-left">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-1">Experience</p>
            <p className="text-3xl font-semibold">15+</p>
            <p className="text-sm text-slate-300 mt-1">years shipping physical products</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-1">Products</p>
            <p className="text-3xl font-semibold">200+</p>
            <p className="text-sm text-slate-300 mt-1">SKUs taken from idea to production</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-1">Regions</p>
            <p className="text-3xl font-semibold">4</p>
            <p className="text-sm text-slate-300 mt-1">AU, CN, IN, VN and beyond</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-1">Focus</p>
            <p className="text-3xl font-semibold">Founders</p>
            <p className="text-sm text-slate-300 mt-1">Everything we build starts from your side of the table</p>
          </div>
        </div>
      </section>

      {/* STORY / TIMELINE */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
                Our Story
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                From late-night factory calls to a platform built for what we wished we had.
              </h2>
              <p className="text-slate-600 mb-4">
                ManuPilot began after years of building and shipping physical products — from
                backyard prototypes to large-scale production runs. We&apos;ve dealt with unclear quotes,
                missed timelines, and containers stuck in ports.
              </p>
              <p className="text-slate-600">
                Instead of accepting that &quot;this is just how it works&quot;, we started building internal
                tools to track specs, manage communication and forecast risk. Those tools evolved
                into what you see today: a dedicated OS for modern manufacturing.
              </p>
            </div>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="mt-1 h-10 w-px bg-slate-300 relative">
                  <span className="absolute -top-1 h-3 w-3 rounded-full bg-sky-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">2015–2019</p>
                  <p className="font-medium">Learning the hard way</p>
                  <p className="text-sm text-slate-600">
                    Building and importing our own products, discovering firsthand how messy
                    manufacturing can be — and how powerful good partners are.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-10 w-px bg-slate-300 relative">
                  <span className="absolute -top-1 h-3 w-3 rounded-full bg-sky-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">2020–2023</p>
                  <p className="font-medium">Building the internal playbook</p>
                  <p className="text-sm text-slate-600">
                    Creating spreadsheets, checklists and tooling to run our own sourcing with more
                    predictability — from specs to shipping plans.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-10 w-px bg-slate-300 relative">
                  <span className="absolute -top-1 h-3 w-3 rounded-full bg-sky-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">2024–Today</p>
                  <p className="font-medium">Launching ManuPilot</p>
                  <p className="text-sm text-slate-600">
                    Turning all that experience into a product that helps founders everywhere design,
                    source and ship better — with an AI co-pilot by their side.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Ready to turn your next idea into something you can hold in your hands?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Start with a single project. ManuPilot will guide you from concept to factory-ready
            brief — and connect you with the right partners when you&apos;re ready to move.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center rounded-full bg-sky-600 text-white px-7 py-3 text-sm font-medium hover:bg-sky-500 transition"
            >
              Create your free account
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-slate-300 text-slate-800 px-7 py-3 text-sm font-medium hover:bg-slate-100 transition"
            >
              Explore the dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}