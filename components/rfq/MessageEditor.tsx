import React from 'react';
import { Edit2 } from 'lucide-react';

interface MessageEditorProps {
    message: string;
    onUpdate: (message: string) => void;
    projectTitle: string;
    category: string;
}

export default function MessageEditor({ message, onUpdate, projectTitle, category }: MessageEditorProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">2</div>
                    <h3 className="text-lg font-bold text-slate-900">RFQ Summary & Message</h3>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded">Custom OEM</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded">Target: TBD</span>
                </div>
            </div>

            <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Message to Suppliers
                </label>
                <textarea
                    value={message}
                    onChange={(e) => onUpdate(e.target.value)}
                    rows={8}
                    className="w-full p-4 text-sm text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono bg-slate-50"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-400 pointer-events-none">
                    Markdown Supported
                </div>
            </div>
        </div>
    );
}
