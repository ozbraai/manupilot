'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import SampleStatusTracker from '@/components/samples/SampleStatusTracker';
import QCChecklist from '@/components/samples/QCChecklist';
import SamplePhotos from '@/components/samples/SamplePhotos';
import SampleEvaluation from '@/components/samples/SampleEvaluation';
import { Sample, SampleQCItem, SamplePhoto, SampleStatus } from '@/types/samples';
import { PlaybookV2 } from '@/types/playbook';

export default function ProjectSamplesPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // State
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const [playbook, setPlaybook] = useState<PlaybookV2 | null>(null);

    const [samples, setSamples] = useState<Sample[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

    const [qcItems, setQcItems] = useState<SampleQCItem[]>([]);
    const [loadingQC, setLoadingQC] = useState(false);

    const [photos, setPhotos] = useState<SamplePhoto[]>([]);

    // Mobile sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Derived
    const selectedSample = samples.find(s => s.id === selectedSampleId);

    // === LOAD DATA ===
    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);

            try {
                // 1. Project & Playbook
                const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single();
                if (proj) setProject(proj);

                if (typeof window !== 'undefined') {
                    const storedPlaybookStr = window.localStorage.getItem(`manupilot_playbook_project_${id}`);
                    if (storedPlaybookStr) {
                        const parsed = JSON.parse(storedPlaybookStr);
                        if (parsed.free) setPlaybook(parsed as PlaybookV2);
                    }
                }

                // 2. Samples
                const { data: samplesData } = await supabase
                    .from('samples')
                    .select('*')
                    .eq('project_id', id)
                    .order('created_at', { ascending: true });

                if (samplesData) {
                    setSamples(samplesData as Sample[]);
                    if (samplesData.length > 0) {
                        setSelectedSampleId(samplesData[0].id);
                    }
                }

            } catch (error) {
                console.error('Error loading samples page:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

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
        if (!id) return;
        const nextNum = samples.length + 1;
        const sampleNum = `T${nextNum}`;

        try {
            const { data: newSample, error } = await supabase
                .from('samples')
                .insert({
                    project_id: id,
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
        } catch (error) {
            console.error('Error creating sample:', error);
            alert('Failed to create sample.');
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
        if (!selectedSampleId || !playbook) return;
        setLoadingQC(true);
        try {
            const res = await fetch('/api/qc/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: id,
                    sampleId: selectedSampleId,
                    playbook
                })
            });
            const data = await res.json();
            if (data.items) {
                setQcItems(data.items);
            }
        } catch (error) {
            console.error('Error generating QC:', error);
            alert('Failed to generate QC checklist.');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Samples...</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 flex">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:sticky lg:top-16 lg:inset-y-auto lg:h-[calc(100vh-4rem)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <ProjectSidebar
                    activeView="samples" // We need to update Sidebar to accept this or map it
                    onChangeView={(view) => {
                        if (view !== 'samples') router.push(`/projects/${id}`);
                        setSidebarOpen(false);
                    }}
                    title={project?.title}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full p-4 md:p-8 lg:p-12">

                {/* Mobile Hamburger */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
                    <svg className="w-6 h-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>

                <div className="mb-8 mt-12 lg:mt-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Samples & Quality Checks</h1>
                    <p className="text-slate-500 mt-2">Track sampling progress and ensure product quality before mass production.</p>
                </div>

                <div className="space-y-6 max-w-7xl">

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

            </main>
        </div>
    );
}
