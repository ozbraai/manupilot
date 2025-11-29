'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useWizard } from './WizardContext';

import { FeasibilityFeatures, UniquenessFactor } from '@/lib/feasibility';
import { SourcingMode } from '@/types/playbook';

// === TYPES ===
type DesignStage =
    | "Idea only"
    | "Rough sketch or moodboard"
    | "Detailed design (CAD, drawings or tech pack)"
    | "Working prototype"
    | "Existing product I already buy or sell";

type SimilarProduct = {
    id: string;
    title: string;
    imageUrl?: string;
    reason: string;
};

type ComponentData = {
    id: string;
    name: string;
    category: string;
    defaultMaterial: string;
    selectedMaterial?: string;
    materialOptions: string[];
    defaultFeatures: string[];
    selectedFeatures?: string[];
    featureOptions: Record<string, string[]>;
};

type VisualElement = {
    id: string;
    name: string;
    type: string;
    options: string[];
    default: string;
    selectedOption?: string;
};

// === CONSTANTS ===
const ANALYSIS_STEPS = [
    'Understanding your idea...',
    'Extracting product components...',
    'Generating product visualization...',
    'Searching for similar products...',
    'Estimating typical costs, MOQs and timelines...',
    'Assessing manufacturability and complexity...',
];

const PLAYBOOK_STEPS = [
    'Finalising your product understanding...',
    'Building your manufacturing playbook...',
    'Mapping components, suppliers and processes...',
    'Estimating costs, MOQs and timelines...',
    'Preparing roadmap and risk assessment...',
];

const DESIGN_STAGES: DesignStage[] = [
    "Idea only",
    "Rough sketch or moodboard",
    "Detailed design (CAD, drawings or tech pack)",
    "Working prototype",
    "Existing product I already buy or sell"
];

const DESIGN_STAGE_ICONS: Record<DesignStage, string> = {
    "Idea only": "💡",
    "Rough sketch or moodboard": "✏️",
    "Detailed design (CAD, drawings or tech pack)": "📐",
    "Working prototype": "🛠️",
    "Existing product I already buy or sell": "📦"
};

// === MAIN COMPONENT ===
export default function WizardModal() {
    const router = useRouter();
    const { isOpen, closeWizard, isNdaSigned, openNdaModal } = useWizard();

    // === STATE ===
    const [stepIndex, setStepIndex] = useState(1); // 1=Idea, 2=Confirm, 3=Approach

    // Step 1: Idea
    const [idea, setIdea] = useState('');
    const [referenceLink, setReferenceLink] = useState('');
    const [designStage, setDesignStage] = useState<DesignStage>('Idea only');
    const [imageFile, setImageFile] = useState<File | null>(null); // For UI only currently

    // Analysis Data (from API)
    const [analysisData, setAnalysisData] = useState<{
        productName: string;
        category: string;
        coreProductSummary: string;
        keyCharacteristics: string[];
        similarProducts: SimilarProduct[];
        feasibilityInputs?: FeasibilityFeatures;
        aiSuggestedSourcingMode?: SourcingMode;
        suggestedUniquenessFactor?: UniquenessFactor;
    } | null>(null);

    // Step 2: Visual Configurator (NEW)
    const [componentsData, setComponentsData] = useState<{
        components: ComponentData[];
        visualElements: VisualElement[];
    } | null>(null);

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageGenerating, setImageGenerating] = useState(false);
    const [imagePrompt, setImagePrompt] = useState<string>('');

    // Step 3: Confirm (was Step 2)
    const [selectedSimilarProductId, setSelectedSimilarProductId] = useState<string | null>(null);

    // Step 4: Approach (was Step 3)
    const [sourcingMode, setSourcingMode] = useState<SourcingMode | null>(null);
    const [uniquenessFactor, setUniquenessFactor] = useState<UniquenessFactor | null>(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingStepIndex, setLoadingStepIndex] = useState(0); // For cycling text
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStepIndex(1);
            setIdea('');
            setReferenceLink('');
            setDesignStage('Idea only');
            setImageFile(null);
            setAnalysisData(null);
            setComponentsData(null);
            setGeneratedImage(null);
            setImagePrompt('');
            setSelectedSimilarProductId(null);
            setSourcingMode(null);
            setUniquenessFactor(null);
            setError(null);
        }
    }, [isOpen]);

    // === EFFECTS ===
    // Cycling text for loading states
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingStepIndex((prev) => (prev + 1) % 5); // Cycle 0-4
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    // Pre-select sourcing mode and uniqueness when analysis is done
    useEffect(() => {
        if (analysisData?.aiSuggestedSourcingMode) {
            setSourcingMode(analysisData.aiSuggestedSourcingMode);
        }
        if (analysisData?.suggestedUniquenessFactor) {
            setUniquenessFactor(analysisData.suggestedUniquenessFactor);
        }
    }, [analysisData]);

    // Auto-select valid uniqueness when sourcing mode changes
    useEffect(() => {
        if (!sourcingMode) return;

        if (sourcingMode === 'auto') return;

        const validOptions: Record<string, string[]> = {
            'white-label': ['branding_only', 'light_improvements'],
            'custom': ['moderate_innovation', 'highly_unique', 'category_creating'],
            'combination': ['branding_only', 'light_improvements', 'moderate_innovation', 'highly_unique', 'category_creating']
        };

        const currentIsValid = uniquenessFactor && validOptions[sourcingMode].includes(uniquenessFactor);

        if (!currentIsValid) {
            // Default to the first valid option if current selection is invalid
            // Or prefer the AI suggestion if it's valid for this mode
            if (analysisData?.suggestedUniquenessFactor && validOptions[sourcingMode].includes(analysisData.suggestedUniquenessFactor)) {
                setUniquenessFactor(analysisData.suggestedUniquenessFactor);
            } else {
                // Fallback defaults
                if (sourcingMode === 'white-label') setUniquenessFactor('branding_only');
                if (sourcingMode === 'custom') setUniquenessFactor('highly_unique');
                if (sourcingMode === 'combination') setUniquenessFactor('moderate_innovation');
            }
        }
    }, [sourcingMode, analysisData]);

    // === HANDLERS ===

    async function handleAnalyze() {
        if (!idea.trim()) {
            setError('Please describe your idea before continuing.');
            return;
        }

        setLoading(true);
        setError(null);
        setLoadingStepIndex(0);

        try {
            // Step 1: Analyze idea (existing)
            const analyzeRes = await fetch('/api/wizard/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    referenceLink,
                    designStage,
                    image: imageFile ? { name: imageFile.name } : null
                })
            });

            const analyzeData = await analyzeRes.json();
            if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed');

            setAnalysisData(analyzeData);

            // Step 2: Extract components (NEW)
            setLoadingStepIndex(1); // Update loading message
            const componentsRes = await fetch('/api/wizard/extract-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    productName: analyzeData.productName,
                    category: analyzeData.category
                })
            });

            const componentsResult = await componentsRes.json();
            if (!componentsRes.ok) throw new Error('Component extraction failed');

            setComponentsData(componentsResult);

            // Step 3: Generate initial image (NEW)
            setLoadingStepIndex(2);

            // Construct prompt
            const componentDescriptions = componentsResult.components.map((comp: any) => {
                const features = comp.selectedFeatures?.join(', ') || comp.defaultFeatures?.join(', ');
                return `${comp.name}: ${comp.selectedMaterial || comp.defaultMaterial}${features ? ` (${features})` : ''}`;
            }).join(', ');

            const visualDescriptions = componentsResult.visualElements?.map((elem: any) => {
                return `${elem.name}: ${elem.selectedOption || elem.default}`;
            }).join(', ');

            const prompt = `
High-quality professional product photography of a ${analyzeData.productName}.
Category: ${analyzeData.category}.

Product Details:
${componentDescriptions}

Visual Style:
${visualDescriptions}

Style: Clean studio lighting, white background, 3/4 angle view, photorealistic, professional product photography, high detail, 4K quality.
`;

            const imageRes = await fetch('/api/visualize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const imageResult = await imageRes.json();
            if (!imageRes.ok || !imageResult.success) throw new Error(imageResult.error || 'Image generation failed');

            setGeneratedImage(imageResult.image);
            setImagePrompt(prompt);

            // Move to Visual Configurator (Step 2)
            setStepIndex(2);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to analyze your idea. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleRegenerateImage() {
        if (!componentsData || !analysisData) return;

        setImageGenerating(true);

        try {
            // Construct prompt
            const componentDescriptions = componentsData.components.map((comp: any) => {
                const features = comp.selectedFeatures?.join(', ') || comp.defaultFeatures?.join(', ');
                return `${comp.name}: ${comp.selectedMaterial || comp.defaultMaterial}${features ? ` (${features})` : ''}`;
            }).join(', ');

            const visualDescriptions = componentsData.visualElements?.map((elem: any) => {
                return `${elem.name}: ${elem.selectedOption || elem.default}`;
            }).join(', ');

            const prompt = `
High-quality professional product photography of a ${analysisData.productName}.
Category: ${analysisData.category}.

Product Details:
${componentDescriptions}

Visual Style:
${visualDescriptions}

Style: Clean studio lighting, white background, 3/4 angle view, photorealistic, professional product photography, high detail, 4K quality.
`;

            const imageRes = await fetch('/api/visualize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const imageResult = await imageRes.json();
            if (!imageRes.ok || !imageResult.success) throw new Error(imageResult.error || 'Image regeneration failed');

            setGeneratedImage(imageResult.image);
            setImagePrompt(prompt);

        } catch (err: any) {
            console.error(err);
            setError('Failed to regenerate image. Please try again.');
        } finally {
            setImageGenerating(false);
        }
    }

    function updateComponent(componentId: string, field: 'selectedMaterial' | 'selectedFeatures', value: any) {
        if (!componentsData) return;

        const updatedComponents = componentsData.components.map(comp =>
            comp.id === componentId
                ? { ...comp, [field]: value }
                : comp
        );

        setComponentsData({
            ...componentsData,
            components: updatedComponents
        });

        // Auto-regenerate image after 1 second delay (debounced)
        setTimeout(() => {
            handleRegenerateImage();
        }, 1000);
    }

    function updateVisualElement(elementId: string, selectedOption: string) {
        if (!componentsData) return;

        const updatedElements = componentsData.visualElements.map(elem =>
            elem.id === elementId
                ? { ...elem, selectedOption }
                : elem
        );

        setComponentsData({
            ...componentsData,
            visualElements: updatedElements
        });

        setTimeout(() => {
            handleRegenerateImage();
        }, 1000);
    }

    async function handleSubmitPlaybook() {
        if (!analysisData || !sourcingMode) return;

        setLoading(true);
        setError(null);
        setLoadingStepIndex(0);

        try {
            const res = await fetch('/api/playbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Core inputs
                    idea,
                    productName: analysisData.productName,
                    category: analysisData.category,
                    coreProduct: analysisData.coreProductSummary,

                    // New inputs
                    designStage,
                    referenceLink,
                    selectedSimilarProductId,
                    keyCharacteristics: analysisData.keyCharacteristics,
                    feasibilityInputs: analysisData.feasibilityInputs,

                    // Sourcing
                    sourcingMode,
                    uniquenessFactor,

                    // Empty/Default legacy fields to satisfy type if needed (though API handles optionals)
                    componentsInfo: null,
                    questions: [],
                    answers: {},
                    constraints: {},
                    costEstimate: null
                })
            });

            const json = await res.json();
            if (!res.ok || !json.playbook) throw new Error(json.error || 'Failed to generate playbook.');

            // Derive legacy commercials fields expected by the Project view
            const financials = json.playbook?.financials || {};
            const unitEconomics = financials.unitEconomics || {};
            const startupCapital = financials.startupCapital || {};

            const derivedCostEstimate = {
                unitCostRange: unitEconomics.exWorksCost || unitEconomics.landedCost || '',
                moqRange: '', // Not provided by AI financials; keep empty to avoid misleading values
                retailRange: unitEconomics.retailPrice || '',
                packagingCostRange: '',
                notes: financials.hiddenCosts?.join('; ') || ''
            };

            const derivedConstraints = {
                targetUnitPrice: unitEconomics.exWorksCost || '',
                maxUnitPrice: unitEconomics.landedCost || '',
                moq: startupCapital.moqBasis || ''
            };

            // Save to localStorage
            if (typeof window !== 'undefined') {
                // Capture wizard step 1 input for later reference
                const wizardInput = {
                    originalIdea: idea,
                    referenceLink: referenceLink || undefined,
                    referenceImage: imageFile ? URL.createObjectURL(imageFile) : undefined,
                    designStage: designStage
                };

                // Find the selected similar product for differentiation text
                const selectedSimilarProduct = analysisData.similarProducts?.find(
                    (p) => p.id === selectedSimilarProductId
                );

                // Build enhanced playbook structure
                const storedPlaybook = {
                    productName: analysisData.productName,
                    category: analysisData.category,
                    mode: sourcingMode,
                    uniquenessFactor: uniquenessFactor, // Store for summary page
                    differentiationText: selectedSimilarProduct?.reason || '',
                    selectedSimilarProductId: selectedSimilarProductId || undefined,
                    wizardInput: wizardInput, // NEW: Store wizard input
                    componentSelections: componentsData, // NEW: Save user's component choices
                    productImage: generatedImage, // NEW: Save final image
                    constraints: derivedConstraints,
                    costEstimate: derivedCostEstimate,
                    free: {
                        ...json.playbook,
                        roadmapPhases: json.roadmapPhases,
                        feasibility: json.feasibility, // Fix: Summary page expects 'feasibility', not 'feasibilitySnapshot'
                        manufacturingRegions: json.playbook.manufacturingApproach?.recommendedRegions || [] // Fix: Map nested regions to top-level
                    }
                };
                window.localStorage.setItem('manupilotPlaybook', JSON.stringify(storedPlaybook));
            }

            closeWizard();
            router.push('/playbook-summary');
        } catch (err: any) {
            console.error(err);
            setError('Something went wrong generating your playbook. Please try again.');
            setLoading(false);
        }
    }

    // === RENDER HELPERS ===

    const renderLoading = (steps: string[]) => (
        <div className="flex flex-col items-center justify-center w-full min-h-[500px] bg-white p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-md text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative h-24 w-24">
                        <div className="absolute inset-0 animate-ping rounded-full bg-sky-400 opacity-20"></div>
                        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-5xl">
                            🤖
                        </div>
                    </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                    {stepIndex === 1 ? 'Analyzing your idea...' : 'Building Playbook...'}
                </h3>
                <div className="h-8 overflow-hidden relative mb-10">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={loadingStepIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-base text-slate-500 font-medium absolute w-full"
                        >
                            {steps[loadingStepIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Progress Bar */}
                <div className="mx-auto max-w-sm">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                            className="h-full bg-sky-500"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {loading ? (
                    renderLoading(stepIndex === 1 ? ANALYSIS_STEPS : PLAYBOOK_STEPS)
                ) : (
                    <>
                        {/* Header */}
                        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        ManuPilot
                                    </p>
                                    {isNdaSigned ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-medium text-emerald-700">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            NDA Signed - Information Protected
                                        </span>
                                    ) : (
                                        <button
                                            onClick={openNdaModal}
                                            title="Sign the NDA to protect the information you share with us."
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Sign NDA
                                        </button>
                                    )}
                                </div>
                                <h1 className="text-lg font-semibold text-slate-900">
                                    Product Playbook Wizard
                                </h1>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end gap-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Step {stepIndex} of 4
                                    </p>
                                    <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-sky-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stepIndex / 4) * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={closeWizard}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </header>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">

                            {/* Error */}
                            {error && (
                                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                                    {error}
                                </div>
                            )}

                            {/* === STEP 1: IDEA === */}
                            {stepIndex === 1 && (
                                <motion.section
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto"
                                >
                                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
                                        Tell us about your product idea
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Idea Textarea */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                What do you want to build?
                                            </label>
                                            <textarea
                                                placeholder="Describe your product, its purpose, and what makes it unique..."
                                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[120px]"
                                                value={idea}
                                                onChange={(e) => setIdea(e.target.value)}
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Example: "A compact charcoal BBQ designed for caravaners with foldable legs and a removable ash catcher."
                                            </p>
                                        </div>

                                        {/* Components Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-slate-900">Components</h3>

                                            {componentsData?.components && componentsData.components.length > 0 ? (
                                                componentsData.components.map((component) => (
                                                    <div
                                                        key={component.id}
                                                        className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
                                                    >
                                                        <h4 className="font-semibold text-slate-900">{component.name}</h4>

                                                        {/* Material Selection */}
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-600 uppercase mb-2 block">
                                                                Material
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {component.materialOptions?.map((material) => (
                                                                    <button
                                                                        key={material}
                                                                        onClick={() => updateComponent(component.id, 'selectedMaterial', material)}
                                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${(component.selectedMaterial || component.defaultMaterial) === material
                                                                            ? 'bg-sky-600 text-white shadow-md'
                                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                            }`}
                                                                    >
                                                                        {material}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Feature Options */}
                                                        {component.featureOptions && Object.entries(component.featureOptions).map(([featureName, options]) => (
                                                            <div key={featureName}>
                                                                <label className="text-xs font-medium text-slate-600 uppercase mb-2 block">
                                                                    {featureName}
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(options as string[]).map((option) => {
                                                                        const isSelected = component.selectedFeatures?.includes(option) ||
                                                                            component.defaultFeatures?.includes(option);

                                                                        return (
                                                                            <button
                                                                                key={option}
                                                                                onClick={() => {
                                                                                    const currentFeatures = component.selectedFeatures || component.defaultFeatures || [];
                                                                                    const newFeatures = isSelected
                                                                                        ? currentFeatures.filter(f => f !== option)
                                                                                        : [...currentFeatures, option];
                                                                                    updateComponent(component.id, 'selectedFeatures', newFeatures);
                                                                                }}
                                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                                    }`}
                                                                            >
                                                                                {option}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-slate-500 text-sm">No configurable components found.</p>
                                            )}
                                        </div>

                                        {/* Design Stage */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                What do you already have?
                                            </label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {DESIGN_STAGES.map((stage) => (
                                                    <button
                                                        key={stage}
                                                        type="button"
                                                        onClick={() => setDesignStage(stage)}
                                                        className={`text-left px-4 py-4 rounded-xl border text-sm transition flex items-start gap-3 ${designStage === stage
                                                            ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500 shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <span className="text-xl">{DESIGN_STAGE_ICONS[stage]}</span>
                                                        <span className="font-medium">{stage}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Optional Fields */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Reference Link (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                                                    value={referenceLink}
                                                    onChange={(e) => setReferenceLink(e.target.value)}
                                                    placeholder="https://example.com/competitor"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Upload Image (Optional)
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                                                            }}
                                                        />
                                                        <span>{imageFile ? 'Change Image' : '📷 Upload Sketch/Ref'}</span>
                                                    </label>
                                                    {imageFile && (
                                                        <button
                                                            onClick={() => setImageFile(null)}
                                                            className="text-rose-500 hover:text-rose-700 p-2"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                                {imageFile && <p className="mt-1 text-xs text-slate-500 truncate">{imageFile.name}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleAnalyze}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition shadow-sm hover:shadow"
                                        >
                                            Next: Analyze Idea →
                                        </button>
                                    </div>
                                </motion.section>
                            )}

                            {/* === STEP 2: VISUAL CONFIGURATOR (NEW) === */}
                            {stepIndex === 2 && componentsData && (
                                <motion.section
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-6xl mx-auto"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Left Column: Configurator */}
                                        <div className="lg:col-span-5 space-y-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                                    Customize Your Product
                                                </h2>
                                                <p className="text-sm text-slate-500">
                                                    Adjust materials and features to visualize your product.
                                                </p>
                                            </div>

                                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                                {/* Components List */}
                                                {componentsData.components.map((component) => (
                                                    <div key={component.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                                            {component.name}
                                                        </h4>

                                                        {/* Material */}
                                                        <div className="mb-4">
                                                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 block">
                                                                Material
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {component.materialOptions.map((material) => (
                                                                    <button
                                                                        key={material}
                                                                        onClick={() => updateComponent(component.id, 'selectedMaterial', material)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${(component.selectedMaterial || component.defaultMaterial) === material
                                                                                ? 'bg-white text-sky-700 border border-sky-200 shadow-sm ring-1 ring-sky-100'
                                                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                                                            }`}
                                                                    >
                                                                        {material}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Features */}
                                                        {component.featureOptions && Object.entries(component.featureOptions).map(([featureName, options]) => (
                                                            <div key={featureName} className="mb-2">
                                                                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 block">
                                                                    {featureName}
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(options as string[]).map((option) => {
                                                                        const isSelected = component.selectedFeatures?.includes(option) ||
                                                                            (!component.selectedFeatures && component.defaultFeatures?.includes(option));
                                                                        return (
                                                                            <button
                                                                                key={option}
                                                                                onClick={() => {
                                                                                    const currentFeatures = component.selectedFeatures || component.defaultFeatures || [];
                                                                                    const newFeatures = isSelected
                                                                                        ? currentFeatures.filter(f => f !== option)
                                                                                        : [...currentFeatures, option];
                                                                                    updateComponent(component.id, 'selectedFeatures', newFeatures);
                                                                                }}
                                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                                                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                                                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                                                                    }`}
                                                                            >
                                                                                {option}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}

                                                {/* Visual Elements */}
                                                {componentsData.visualElements.length > 0 && (
                                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                                            <span className="text-lg">🎨</span>
                                                            Visual Style
                                                        </h4>
                                                        {componentsData.visualElements.map((element) => (
                                                            <div key={element.id} className="mb-4 last:mb-0">
                                                                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 block">
                                                                    {element.name}
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {element.options.map((option) => (
                                                                        <button
                                                                            key={option}
                                                                            onClick={() => updateVisualElement(element.id, option)}
                                                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${(element.selectedOption || element.default) === option
                                                                                    ? 'bg-white text-purple-700 border border-purple-200 shadow-sm ring-1 ring-purple-100'
                                                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                                                                }`}
                                                                        >
                                                                            {option}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column: Preview */}
                                        <div className="lg:col-span-7 flex flex-col">
                                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl flex-1 min-h-[400px] relative group">
                                                {generatedImage ? (
                                                    <img
                                                        src={generatedImage}
                                                        alt="AI Generated Product Preview"
                                                        className="w-full h-full object-contain bg-slate-900"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                                        <div className="text-center">
                                                            <div className="animate-spin text-4xl mb-4">✨</div>
                                                            <p>Generating visualization...</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Loading Overlay */}
                                                {imageGenerating && (
                                                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                                                        <div className="text-center text-white">
                                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-3"></div>
                                                            <p className="text-sm font-medium">Updating preview...</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions Overlay */}
                                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={handleRegenerateImage}
                                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                    >
                                                        🔄 Regenerate
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-between items-center">
                                                <button
                                                    onClick={() => setStepIndex(1)}
                                                    className="text-slate-500 text-sm hover:text-slate-700 px-4 py-2"
                                                >
                                                    ← Back to Idea
                                                </button>
                                                <button
                                                    onClick={() => setStepIndex(3)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition shadow-sm hover:shadow"
                                                >
                                                    Looks Good, Continue →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* === STEP 3: CONFIRM (Was Step 2) === */}
                            {stepIndex === 3 && analysisData && (
                                <motion.section
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto"
                                >
                                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
                                        Does this look like what you want to build?
                                    </h2>

                                    {/* Product Understanding */}
                                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 mb-8">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">💡</span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-sky-900 mb-1">
                                                    {analysisData.productName || 'Product Concept'}
                                                </h3>
                                                <p className="text-sm text-sky-800 leading-relaxed mb-3">
                                                    {analysisData.coreProductSummary}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-sky-700 border border-sky-200 shadow-sm">
                                                        Category: {analysisData.category}
                                                    </span>
                                                    {analysisData.keyCharacteristics.map((char, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200">
                                                            {char}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Similar Products */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                                            We found some similar products. Is one of these close to your idea?
                                        </h3>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            {analysisData.similarProducts.map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    onClick={() => setSelectedSimilarProductId(prod.id)}
                                                    className={`cursor-pointer rounded-xl border p-4 transition relative ${selectedSimilarProductId === prod.id
                                                        ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/50'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400 overflow-hidden">
                                                        {prod.imageUrl ? (
                                                            <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl">📦</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium text-slate-900 text-sm mb-1">{prod.title}</h4>
                                                    <p className="text-xs text-slate-500 leading-snug">{prod.reason}</p>

                                                    {selectedSimilarProductId === prod.id && (
                                                        <div className="absolute top-3 right-3 bg-sky-500 text-white rounded-full p-1 shadow-sm">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* None option */}
                                            <div
                                                onClick={() => setSelectedSimilarProductId(null)}
                                                className={`cursor-pointer rounded-xl border p-4 transition flex flex-col items-center justify-center text-center min-h-[200px] ${selectedSimilarProductId === null
                                                    ? 'border-slate-400 ring-1 ring-slate-400 bg-slate-50'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2">🚫</span>
                                                <h4 className="font-medium text-slate-900 text-sm">None of the above</h4>
                                                <p className="text-xs text-slate-500 mt-1">My idea is different</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setStepIndex(3)}
                                            className="text-slate-500 text-sm hover:text-slate-700 px-4 py-2"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={() => setStepIndex(4)}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition shadow-sm hover:shadow"
                                        >
                                            Next: Manufacturing Approach →
                                        </button>
                                    </div>
                                </motion.section>
                            )}

                            {/* === STEP 4: APPROACH (Was Step 3) === */}
                            {stepIndex === 4 && (
                                <motion.section
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto"
                                >
                                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                                        How would you like to proceed?
                                    </h2>
                                    <p className="text-slate-600 text-sm mb-8">
                                        Based on your idea, we recommend the following approach, but you can change it.
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                                        {/* White Label */}
                                        <div
                                            onClick={() => setSourcingMode('white-label')}
                                            className={`cursor-pointer rounded-xl border p-5 transition relative ${sourcingMode === 'white-label'
                                                ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-3">🏷️</div>
                                            <h3 className="font-semibold text-slate-900 mb-2">White Label</h3>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                                Use an existing factory product and add your logo. Best for generic items.
                                            </p>
                                            <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-3">
                                                <li>Lowest startup cost</li>
                                                <li>Low MOQs</li>
                                                <li>Fastest timeline</li>
                                            </ul>
                                            {analysisData?.aiSuggestedSourcingMode === 'white-label' && (
                                                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Recommended</span>
                                            )}
                                        </div>

                                        {/* Combination */}
                                        <div
                                            onClick={() => setSourcingMode('combination')}
                                            className={`cursor-pointer rounded-xl border p-5 transition relative ${sourcingMode === 'combination'
                                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-3">🔧</div>
                                            <h3 className="font-semibold text-slate-900 mb-2">Combination</h3>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                                Modify an existing product (e.g. change materials, add features).
                                            </p>
                                            <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-3">
                                                <li>Medium startup cost</li>
                                                <li>Medium MOQs</li>
                                                <li>Balanced timeline</li>
                                            </ul>
                                            {analysisData?.aiSuggestedSourcingMode === 'combination' && (
                                                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Recommended</span>
                                            )}
                                        </div>

                                        {/* Custom */}
                                        <div
                                            onClick={() => setSourcingMode('custom')}
                                            className={`cursor-pointer rounded-xl border p-5 transition relative ${sourcingMode === 'custom'
                                                ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-50/30'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-3">⚙️</div>
                                            <h3 className="font-semibold text-slate-900 mb-2">Custom Design</h3>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                                Design from scratch. Best for unique inventions or specific needs.
                                            </p>
                                            <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-3">
                                                <li>Higher startup cost</li>
                                                <li>Higher MOQs</li>
                                                <li>Longer timeline</li>
                                            </ul>
                                            {analysisData?.aiSuggestedSourcingMode === 'custom' && (
                                                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Recommended</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Uniqueness Factor Selection */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                                            How unique is your product?
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'branding_only', label: 'Branding-Only' },
                                                { id: 'light_improvements', label: 'Light Improvements' },
                                                { id: 'moderate_innovation', label: 'Moderate Innovation' },
                                                { id: 'highly_unique', label: 'Highly Unique Design' },
                                                { id: 'category_creating', label: 'Category-Creating' }
                                            ].filter(option => {
                                                if (!sourcingMode) return true;
                                                if (sourcingMode === 'white-label') {
                                                    return ['branding_only', 'light_improvements'].includes(option.id);
                                                }
                                                if (sourcingMode === 'custom') {
                                                    return ['moderate_innovation', 'highly_unique', 'category_creating'].includes(option.id);
                                                }
                                                return true; // Combination shows all
                                            }).map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setUniquenessFactor(option.id as UniquenessFactor)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${uniquenessFactor === option.id
                                                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setStepIndex(3)}
                                            className="text-slate-500 text-sm hover:text-slate-700 px-4 py-2"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handleSubmitPlaybook}
                                            disabled={!sourcingMode || !uniquenessFactor}
                                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Generate Playbook ✨
                                        </button>
                                    </div>
                                </motion.section>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
