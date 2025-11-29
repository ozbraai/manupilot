'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SamplePhoto } from '@/types/samples';

type SamplePhotosProps = {
    sampleId: string;
    photos: SamplePhoto[];
    onPhotoUploaded: (photo: SamplePhoto) => void;
};

export default function SamplePhotos({ sampleId, photos, onPhotoUploaded }: SamplePhotosProps) {
    const [uploading, setUploading] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const [analysisResult, setAnalysisResult] = useState<{ recommendation: string; description: string; defects: string[] } | null>(null);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${sampleId}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Storage Upload Error:', uploadError);
                throw new Error(`Storage Error: ${uploadError.message}`);
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(filePath);

            // 3. Save to DB
            const { data: photo, error: dbError } = await supabase
                .from('sample_photos')
                .insert({
                    sample_id: sampleId,
                    file_url: publicUrl,
                    caption: file.name
                })
                .select()
                .single();

            if (dbError) throw dbError;

            if (photo) {
                onPhotoUploaded(photo as SamplePhoto);
            }

        } catch (error: any) {
            console.error('Error uploading photo:', error);
            // Distinguish between storage and DB errors if possible, or just show the message
            // The error object usually has details.
            let msg = error.message || error.error_description || JSON.stringify(error);
            if (msg.includes('row-level security')) {
                msg += ' (Likely DB Insert)';
            }
            if (msg.includes('Bucket')) {
                msg += ' (Storage Bucket)';
            }
            alert(`Failed to upload photo: ${msg}`);
        } finally {
            setUploading(false);
        }
    }

    async function handleAnalyze(photo: SamplePhoto) {
        setAnalyzingId(photo.id);
        try {
            const res = await fetch('/api/samples/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photoUrl: photo.file_url,
                    sampleId: photo.sample_id,
                    photoId: photo.id,
                    context: `Sample photo: ${photo.caption || 'No caption'}`
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');

            if (!data.analysis) {
                throw new Error('No analysis data received from API');
            }
            console.log('Setting analysis result:', data.analysis);
            setAnalysisResult(data.analysis);

        } catch (error: any) {
            console.error('Error analyzing photo:', error);
            alert(`Failed to analyze photo: ${error.message}`);
        } finally {
            setAnalyzingId(null);
        }
    }

    useEffect(() => {
        console.log('Analysis Result State Changed:', analysisResult);
    }, [analysisResult]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    <h3 className="text-lg font-bold text-slate-900">Sample Photos</h3>
                </div>
                <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'Uploading...' : '+ Add Photo'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {photos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm mb-2">No photos uploaded yet.</p>
                    <p className="text-xs text-slate-400">Upload images to document defects or quality.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map(photo => (
                        <div key={photo.id} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <img
                                src={photo.file_url}
                                alt={photo.caption || 'Sample photo'}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-10">
                                <button
                                    onClick={(e) => {
                                        console.log('Analyze clicked for:', photo.id);
                                        e.stopPropagation();
                                        handleAnalyze(photo);
                                    }}
                                    disabled={analyzingId === photo.id}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all ${analyzingId === photo.id
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white text-slate-900 hover:bg-slate-50 cursor-pointer'
                                        } ${analyzingId !== photo.id ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                >
                                    {analyzingId === photo.id ? 'Analyzing...' : '✨ Inspect'}
                                </button>
                            </div>
                            {/* Test Button for Debugging */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setAnalysisResult({
                                        recommendation: 'TEST PASS',
                                        description: 'This is a test description to verify the modal works.',
                                        defects: ['Test Defect 1', 'Test Defect 2']
                                    });
                                }}
                                className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] px-2 py-1 rounded"
                            >
                                Test Modal
                            </button>
                            {photo.ai_analysis && (
                                <div className="absolute bottom-2 right-2">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                                        Analyzed
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Analysis Result Modal */}
            {analysisResult && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">AI Analysis Result</h3>
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-3 rounded-lg border ${analysisResult.recommendation?.toLowerCase().includes('pass')
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}>
                                <span className="font-bold block text-xs uppercase opacity-70 mb-1">Recommendation</span>
                                <span className="font-bold text-lg">{analysisResult.recommendation}</span>
                            </div>

                            <div>
                                <span className="font-bold block text-xs uppercase text-slate-500 mb-1">Description</span>
                                <p className="text-sm text-slate-700">{analysisResult.description}</p>
                            </div>

                            {analysisResult.defects && analysisResult.defects.length > 0 && (
                                <div>
                                    <span className="font-bold block text-xs uppercase text-slate-500 mb-1">Defects Found</span>
                                    <ul className="list-disc list-inside text-sm text-slate-700">
                                        {analysisResult.defects.map((defect, i) => (
                                            <li key={i}>{defect}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
