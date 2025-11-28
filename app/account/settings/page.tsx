import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CURRENT_NDA_VERSION } from '@/lib/nda';
import DeleteNdaButton from '@/components/settings/DeleteNdaButton';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          // Server component read-only
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let ndaAcceptance = null;
  if (user) {
    const { data } = await supabase
      .from('nda_acceptances')
      .select('*')
      .eq('user_id', user.id)
      .eq('nda_version', CURRENT_NDA_VERSION)
      .single();
    ndaAcceptance = data;
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
            Account
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Settings & preferences.
          </h1>
          <p className="text-slate-600">
            Notification preferences, regions of interest, default shipping options and integration
            settings will live here.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-lg mx-auto px-6 md:px-10 space-y-8">

          {/* NDA Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confidentiality & NDA</h3>

            {ndaAcceptance ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">NDA Active</span>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Version:</strong> {ndaAcceptance.nda_version}</p>
                  <p><strong>Signed on:</strong> {new Date(ndaAcceptance.accepted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    This NDA applies to all current and future playbooks and projects you create in ManuPilot.
                  </p>
                  <DeleteNdaButton />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  You have not yet signed an NDA with ManuPilot. We will offer you the option when you start a new questionnaire.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 text-center">
            More settings controls coming soon.
          </div>
        </div>
      </section>
    </main>
  );
}