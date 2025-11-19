export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Account
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Your profile.
          </h1>
          <p className="text-slate-600">
            This is where you&apos;ll manage your details, role (entrepreneur, agent, manufacturer)
            and basic company information.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-lg mx-auto px-6 md:px-10">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 text-center">
            Profile editing UI coming soon.
            <br />
            For now, this is a placeholder so we can design and test navigation.
          </div>
        </div>
      </section>
    </main>
  );
}