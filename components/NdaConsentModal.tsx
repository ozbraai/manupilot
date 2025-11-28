'use client';

import React, { useState } from 'react';

type NdaConsentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAccepted: () => void;
};

export function NdaConsentModal({
    isOpen,
    onClose,
    onAccepted,
}: NdaConsentModalProps) {
    const [hasRead, setHasRead] = useState(false);
    const [typedName, setTypedName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function handleAccept() {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/nda/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ typedName }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('NDA Accept Failed:', res.status, res.statusText, errorText);
                throw new Error(`Failed to accept NDA: ${res.status} ${errorText}`);
            }

            onAccepted();
            onClose();
        } catch (err: any) {
            console.error('NDA acceptance error:', err);
            setError('Failed to record acceptance. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Protecting your designs with a quick NDA
                    </h2>
                </div>

                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            If you are going to share sensitive product ideas, drawings or IP in this questionnaire, we recommend signing our digital NDA with ManuPilot. It takes a few seconds and covers all future projects.
                        </p>

                        <p className="text-sm font-medium text-slate-900">
                            Are you planning to share sensitive information?
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-64 overflow-y-auto text-xs text-slate-600 space-y-3">
                        <p className="font-semibold text-slate-900">NON-DISCLOSURE AGREEMENT</p>
                        <p>
                            This Non-Disclosure Agreement (the &quot;Agreement&quot;) is entered into by and between the User (&quot;Disclosing Party&quot;) and ManuPilot (&quot;Receiving Party&quot;) for the purpose of preventing the unauthorized disclosure of Confidential Information as defined below.
                        </p>
                        <p>
                            1. <strong>Definition of Confidential Information.</strong> For purposes of this Agreement, &quot;Confidential Information&quot; shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged. If Confidential Information is in written form, the Disclosing Party shall label or stamp the materials with the word &quot;Confidential&quot; or some similar warning. If Confidential Information is transmitted orally, the Disclosing Party shall promptly provide a writing indicating that such oral communication constituted Confidential Information.
                        </p>
                        <p>
                            2. <strong>Exclusions from Confidential Information.</strong> Receiving Party&apos;s obligations under this Agreement do not extend to information that is: (a) publicly known at the time of disclosure or subsequently becomes publicly known through no fault of the Receiving Party; (b) discovered or created by the Receiving Party before disclosure by Disclosing Party; (c) learned by the Receiving Party through legitimate means other than from the Disclosing Party or Disclosing Party&apos;s representatives; or (d) is disclosed by Receiving Party with Disclosing Party&apos;s prior written approval.
                        </p>
                        <p>
                            3. <strong>Obligations of Receiving Party.</strong> Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. Receiving Party shall carefully restrict access to Confidential Information to employees, contractors, and third parties as is reasonably required and shall require those persons to sign nondisclosure restrictions at least as protective as those in this Agreement. Receiving Party shall not, without prior written approval of Disclosing Party, use for Receiving Party&apos;s own benefit, publish, copy, or otherwise disclose to others, or permit the use by others for their benefit or to the detriment of Disclosing Party, any Confidential Information.
                        </p>
                        <p>
                            4. <strong>Time Periods.</strong> The nondisclosure provisions of this Agreement shall survive the termination of this Agreement and Receiving Party&apos;s duty to hold Confidential Information in confidence shall remain in effect until the Confidential Information no longer qualifies as a trade secret or until Disclosing Party sends Receiving Party written notice releasing Receiving Party from this Agreement, whichever occurs first.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-sky-600 checked:bg-sky-600 hover:border-sky-500"
                                    checked={hasRead}
                                    onChange={(e) => setHasRead(e.target.checked)}
                                />
                                <svg
                                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="14"
                                    height="14"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">
                                I have read and agree to the ManuPilot Non-Disclosure Agreement (NDA).
                            </span>
                        </label>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-600">
                                Type your full name (optional)
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-slate-500 hover:text-slate-800 font-medium hover:underline px-2"
                    >
                        Skip for now and continue without NDA
                    </button>

                    <button
                        type="button"
                        onClick={handleAccept}
                        disabled={!hasRead || loading}
                        className="rounded-full bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow active:scale-[0.98]"
                    >
                        {loading ? 'Accepting...' : 'Accept NDA and continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
