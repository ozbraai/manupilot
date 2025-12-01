import { loadProject } from '@/lib/project-loader';
import ProjectShell from '@/components/project/ProjectShell';
import { calculateProgress, PHASE_CONFIG } from '@/lib/progress';
import { CheckCircle2, Circle, Clock, Lock } from 'lucide-react';

export default async function ProjectRoadmapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    // We need to cast the loaded project back to the shape expected by calculateProgress
    // or update calculateProgress to accept LoadedProject. For now, we'll cast.
    const progress = calculateProgress(project as any);
    const { phaseProgress, currentPhase } = progress;

    return (
        <ProjectShell
            projectId={project.id}
            title={project.title}
            activeView="roadmap"
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Project Roadmap</h1>
                    <p className="text-slate-500">Track your journey from concept to launch.</p>
                </div>

                {/* ROADMAP VISUALIZATION */}
                <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-12 pb-12">
                    {phaseProgress.map((phase, idx) => {
                        const isCompleted = phase.earned === phase.total;
                        const isCurrent = phase.phase === currentPhase;
                        const isFuture = !isCompleted && !isCurrent;
                        const config = PHASE_CONFIG[phase.phase];

                        return (
                            <div key={phase.phase} className="relative pl-8 md:pl-12">
                                {/* Timeline Node */}
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-emerald-500 border-emerald-500' :
                                    isCurrent ? 'bg-white border-slate-900 ring-4 ring-slate-100' :
                                        'bg-white border-slate-300'
                                    }`} />

                                <div className={`transition-opacity duration-500 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
                                    {/* Phase Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <h2 className={`text-lg font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {config.label}
                                        </h2>
                                        {isCurrent && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                                                Current Phase
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="text-emerald-600 flex items-center gap-1 text-sm font-medium">
                                                <CheckCircle2 className="w-4 h-4" /> Completed
                                            </span>
                                        )}
                                    </div>

                                    {/* Milestones Card */}
                                    <div className={`bg-white border rounded-xl overflow-hidden ${isCurrent ? 'border-slate-300 shadow-md ring-1 ring-slate-100' : 'border-slate-200'
                                        }`}>
                                        <div className="divide-y divide-slate-100">
                                            {phase.milestones.map((milestone) => (
                                                <div key={milestone.key} className={`p-4 flex items-start gap-4 ${milestone.completed ? 'bg-slate-50/50' : ''
                                                    }`}>
                                                    <div className="mt-0.5">
                                                        {milestone.completed ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : isFuture ? (
                                                            <Lock className="w-5 h-5 text-slate-300" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`text-sm font-medium ${milestone.completed ? 'text-slate-900' :
                                                            isFuture ? 'text-slate-400' : 'text-slate-700'
                                                            }`}>
                                                            {milestone.label}
                                                        </h3>
                                                        {milestone.waiting && (
                                                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {milestone.waitingLabel}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Phase Footer / Estimated Time */}
                                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Duration</span>
                                            <span className="text-sm font-medium text-slate-600">
                                                {phase.phase === 'planning' ? '1-2 weeks' :
                                                    phase.phase === 'supplier_sourcing' ? '2-4 weeks' :
                                                        phase.phase === 'sampling' ? '3-6 weeks' :
                                                            phase.phase === 'pre_production' ? '1-2 weeks' :
                                                                '4-8 weeks'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </ProjectShell>
    );
}
