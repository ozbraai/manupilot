// components/project/MissingInfoScanner.tsx
'use client';

import React from 'react';

type MissingInfoScannerProps = {
    missingInfo: string[];
};

export default function MissingInfoScanner({ missingInfo }: MissingInfoScannerProps) {
    if (!missingInfo || missingInfo.length === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                    <span>✅</span>
                    <span className="font-medium">All critical information captured!</span>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                ⚠️ Missing Information Scanner
            </h4>
            <p className="text-xs text-amber-700 mb-3">
                These data points are still needed for a complete manufacturing plan:
            </p>
            <ul className="space-y-2">
                {missingInfo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
