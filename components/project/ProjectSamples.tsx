'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SampleStatusTracker from '@/components/samples/SampleStatusTracker';
import QCChecklist from '@/components/samples/QCChecklist';
import SamplePhotos from '@/components/samples/SamplePhotos';
import SampleEvaluation from '@/components/samples/SampleEvaluation';
import { Sample, SampleQCItem, SamplePhoto, SampleStatus } from '@/types/samples';
import { PlaybookV2 } from '@/types/playbook';

type ProjectSamplesProps = {
    projectId: string;
    playbook: PlaybookV2 | null;
};

export default function ProjectSamples({ projectId, playbook }: ProjectSamplesProps) {
    // State
    const [loading, setLoading] = useState(true);
    const [samples, setSamples] = useState<Sample[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

    const [qcItems, setQcItems] = useState<SampleQCItem[]>([]);
    const [loadingQC, setLoadingQC] = useState(false);

    const [photos, setPhotos] = useState<SamplePhoto[]>([]);

    // Derived
    const selectedSample = samples.find(s => s.id === selectedSampleId);

    // === LOAD DATA ===
    useEffect(() => {
        async function loadData() {
            if (!projectId) return;
            setLoading(true);

            try {
                // Samples
                const { data: samplesData } = await supabase
                    .from('samples')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: true });

                if (samplesData) {
                    setSamples(samplesData as Sample[]);
                    if (samplesData.length > 0) {
                        setSelectedSampleId(samplesData[0].id);
                    }
                }

            } catch (error) {
                console.error('Error loading samples:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [projectId]);

    // === LOAD SAMPLE DETAILS ===
    useEffect(() => {
        async function loadSampleDetails() {
            if (!selectedSampleId) {
                setQcItems([]);
                setPhotos([]);
                return;
            }

            setLoadingQC(true);
            try {
                // QC Items
                const { data: qc } = await supabase
                    .from('sample_qc')
                    .select('*')
                    .eq('sample_id', selectedSampleId)
                    .order('created_at', { ascending: true });

                setQcItems(qc as SampleQCItem[] || []);

                // Photos
                const { data: ph } = await supabase
                    .from('sample_photos')
                    .select('*')
                    .eq('sample_id', selectedSampleId)
                    .order('created_at', { ascending: false });

                setPhotos(ph as SamplePhoto[] || []);

            } catch (error) {
                console.error('Error loading sample details:', error);
            } finally {
                setLoadingQC(false);
            }
        }

        loadSampleDetails();
    }, [selectedSampleId]);

    // === HANDLERS ===

    async function handleCreateSample() {
        if (!projectId) return;
        const nextNum = samples.length + 1;
        const sampleNum = `T${nextNum}`;

        try {
            const { data: newSample, error } = await supabase
                .from('samples')
                .insert({
                    project_id: projectId,
                    sample_number: sampleNum,
                    status: 'requested',
                    requested_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            if (newSample) {
                setSamples([...samples, newSample as Sample]);
                setSelectedSampleId(newSample.id);
            }
        } catch (error: any) {
            console.error('Error creating sample:', error);
            alert(`Failed to create sample: ${error.message || error.details || 'Unknown error'}`);
        }
    }

    async function handleUpdateStatus(status: SampleStatus) {
        if (!selectedSampleId) return;

        const updates: any = { status };
        if (status === 'received') updates.received_at = new Date().toISOString();
        if (status === 'approved' || status === 'revision_required') updates.evaluated_at = new Date().toISOString();

        try {
            const { error } = await supabase
                .from('samples')
                .update(updates)
                .eq('id', selectedSampleId);

            if (error) throw error;

            // Update local state
            setSamples(samples.map(s => s.id === selectedSampleId ? { ...s, ...updates } : s));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async function handleGenerateQC() {
        if (!selectedSampleId) {
            alert('No sample selected');
            return;
        }
        if (!playbook) {
            alert('Playbook data is missing. Cannot generate QC.');
            return;
        }

        setLoadingQC(true);
        try {
            console.log('Generating QC for:', { projectId, sampleId: selectedSampleId, playbook });
            const res = await fetch('/api/qc/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    sampleId: selectedSampleId,
                    playbook
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'API returned error');
            }

            if (data.items) {
                setQcItems(data.items);
            } else {
                alert('No items returned from AI');
            }
        } catch (error: any) {
            console.error('Error generating QC:', error);
            alert(`Failed to generate QC checklist: ${error.message}`);
        } finally {
            setLoadingQC(false);
        }
    }

    async function handleToggleQC(itemId: string, result: 'pass' | 'fail' | 'not_checked') {
        // Optimistic update
        setQcItems(qcItems.map(i => i.id === itemId ? { ...i, result } : i));

        await supabase
            .from('sample_qc')
            .update({ result })
            .eq('id', itemId);
    }

    async function handleEvaluation(status: SampleStatus, notes: string) {
        if (!selectedSampleId) return;
        try {
            const { error } = await supabase
                .from('samples')
                .update({ status, notes, evaluated_at: new Date().toISOString() })
                .eq('id', selectedSampleId);

            if (error) throw error;

            setSamples(samples.map(s => s.id === selectedSampleId ? { ...s, status, notes } : s));
        } catch (error) {
            console.error('Error saving evaluation:', error);
            alert('Failed to save evaluation.');
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Samples...</div>;

    return (
        <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Samples & Quality Checks</h2>
                <p className="text-slate-500 text-sm md:text-base">Track sampling progress and ensure product quality before mass production.</p>
            </div>

            <div className="space-y-6">

                {/* 1. STATUS TRACKER */}
                <SampleStatusTracker
                    samples={samples}
                    selectedSampleId={selectedSampleId}
                    onSelectSample={setSelectedSampleId}
                    onCreateSample={handleCreateSample}
                    onUpdateStatus={handleUpdateStatus}
                />

                {selectedSampleId ? (
                    <div className="grid lg:grid-cols-2 gap-6">

                        {/* 2. QC CHECKLIST */}
                        <div className="lg:row-span-2">
                            <QCChecklist
                                items={qcItems}
                                loading={loadingQC}
                                onToggleItem={handleToggleQC}
                                onGenerate={handleGenerateQC}
                            />
                        </div>

                        {/* 3. PHOTOS */}
                        <div className="min-h-[300px]">
                            <SamplePhotos
                                sampleId={selectedSampleId}
                                photos={photos}
                                onPhotoUploaded={(photo) => setPhotos([photo, ...photos])}
                            />
                        </div>

                        {/* 4. EVALUATION */}
                        <div className="min-h-[300px]">
                            {selectedSample && (
                                <SampleEvaluation
                                    sample={selectedSample}
                                    onUpdate={handleEvaluation}
                                />
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-400">Create a sample to get started.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
