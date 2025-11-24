'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SamplePhoto } from '@/types/samples';

type SamplePhotosProps = {
    sampleId: string;
    photos: SamplePhoto[];
    onPhotoUploaded: (photo: SamplePhoto) => void;
};

export default function SamplePhotos({ sampleId, photos, onPhotoUploaded }: SamplePhotosProps) {
    const [uploading, setUploading] = useState(false);

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
                .from('project-assets') // Reusing existing bucket if possible, or 'samples'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-assets')
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
            alert('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
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
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            {/* Optional: Add delete button or zoom here */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
