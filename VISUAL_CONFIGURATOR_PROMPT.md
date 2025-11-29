# Visual Configurator Enhancement for ManuPilot Wizard

## Overview
Add a new **Step 2: Visual Configurator** to the playbook wizard that allows users to visually customize their product by adjusting component materials and features, with real-time AI image generation.

---

## Current Wizard Flow (To Be Modified)

**Current Steps:**
1. Step 1: Describe Idea → Click "Analyze Idea"
2. Step 2: Confirm Product & Similar Products
3. Step 3: Select Sourcing Approach & Uniqueness

**New Flow:**
1. Step 1: Describe Idea → Click "Analyze Idea"
2. **Step 2: Visual Configurator** (NEW)
3. Step 3: Confirm Product & Similar Products (was Step 2)
4. Step 4: Select Sourcing Approach & Uniqueness (was Step 3)

---

## Implementation Requirements

### 1. New API Endpoint: Component Extraction

**File**: `app/api/wizard/extract-components/route.ts`

Create a new endpoint that uses Gemini Flash (or GPT-4) to extract structured components from the user's idea.

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const { idea, productName, category } = await req.json();

        const systemPrompt = `
You are a product design expert. Analyze the product idea and extract ALL distinct components.

Product: ${productName}
Category: ${category}
Description: ${idea}

Return a JSON object with this structure:
{
  "components": [
    {
      "id": "comp-1",
      "name": "Lid",
      "category": "structure",
      "defaultMaterial": "Stainless Steel",
      "materialOptions": ["Stainless Steel", "Aluminum", "Plastic", "Glass"],
      "defaultFeatures": ["Vented", "Insulated"],
      "featureOptions": {
        "ventilation": ["None", "Vented", "Sealed"],
        "insulation": ["None", "Insulated", "Double-Walled"]
      }
    },
    {
      "id": "comp-2",
      "name": "Body",
      "category": "structure",
      "defaultMaterial": "Stainless Steel",
      "materialOptions": ["Stainless Steel", "Aluminum", "Cast Iron"],
      "defaultFeatures": ["Non-Stick Coating"],
      "featureOptions": {
        "coating": ["None", "Non-Stick", "Ceramic", "Enamel"]
      }
    },
    {
      "id": "comp-3",
      "name": "Handles",
      "category": "ergonomics",
      "defaultMaterial": "Silicone",
      "materialOptions": ["Silicone", "Wood", "Plastic", "Metal"],
      "defaultFeatures": ["Heat Resistant"],
      "featureOptions": {
        "grip": ["Smooth", "Textured", "Ergonomic"],
        "mounting": ["Riveted", "Welded", "Detachable"]
      }
    }
  ],
  "visualElements": [
    {
      "id": "visual-1",
      "name": "Logo Placement",
      "type": "branding",
      "options": ["None", "Engraved", "Printed", "Embossed"],
      "default": "None"
    },
    {
      "id": "visual-2",
      "name": "Color Scheme",
      "type": "aesthetic",
      "options": ["Silver", "Black", "White", "Custom"],
      "default": "Silver"
    }
  ]
}

Rules:
- Extract 3-8 main components
- For each component, provide 3-6 realistic material options
- Include features specific to that component type
- Add 1-3 visual/branding elements (logo, color, finish)
- Use proper manufacturing terminology
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Extract components for: ${idea}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const componentsData = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json(componentsData);
    } catch (error: any) {
        console.error('Component extraction error:', error);
        return NextResponse.json(
            { error: 'Failed to extract components' },
            { status: 500 }
        );
    }
}
```

---

### 2. New API Endpoint: AI Image Generation

**File**: `app/api/wizard/generate-product-image/route.ts`

Generate product images using DALL-E 3 or Stable Diffusion based on component selections.

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const { productName, category, components, visualElements, idea } = await req.json();

        // Build detailed prompt from component selections
        const componentDescriptions = components.map((comp: any) => {
            const features = comp.selectedFeatures?.join(', ') || comp.defaultFeatures?.join(', ');
            return `${comp.name}: ${comp.selectedMaterial || comp.defaultMaterial}${features ? ` (${features})` : ''}`;
        }).join(', ');

        const visualDescriptions = visualElements?.map((elem: any) => {
            return `${elem.name}: ${elem.selectedOption || elem.default}`;
        }).join(', ');

        const imagePrompt = `
High-quality professional product photography of a ${productName}.
Category: ${category}.

Product Details:
${componentDescriptions}

Visual Style:
${visualDescriptions}

Style: Clean studio lighting, white background, 3/4 angle view, photorealistic, professional product photography, high detail, 4K quality.
`;

        console.log('Generating image with prompt:', imagePrompt);

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
        });

        const imageUrl = response.data[0]?.url;

        if (!imageUrl) {
            throw new Error('No image URL returned');
        }

        return NextResponse.json({
            imageUrl,
            prompt: imagePrompt // Return for debugging/transparency
        });
    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate image', details: error.message },
            { status: 500 }
        );
    }
}
```

---

### 3. Update WizardModal Component State

**File**: `components/wizard/WizardModal.tsx`

Add new state variables for the visual configurator:

```typescript
// ADD THESE NEW STATE VARIABLES (around line 65-95)

// Step 2: Visual Configurator (NEW)
const [componentsData, setComponentsData] = useState<{
    components: Array<{
        id: string;
        name: string;
        category: string;
        defaultMaterial: string;
        selectedMaterial?: string;
        materialOptions: string[];
        defaultFeatures: string[];
        selectedFeatures?: string[];
        featureOptions: Record<string, string[]>;
    }>;
    visualElements: Array<{
        id: string;
        name: string;
        type: string;
        options: string[];
        default: string;
        selectedOption?: string;
    }>;
} | null>(null);

const [generatedImage, setGeneratedImage] = useState<string | null>(null);
const [imageGenerating, setImageGenerating] = useState(false);
const [imagePrompt, setImagePrompt] = useState<string>('');

// UPDATE STEP INDEX (line 65)
const [stepIndex, setStepIndex] = useState(1); // 1=Idea, 2=Visual Config, 3=Confirm, 4=Approach
```

---

### 4. Update handleAnalyze Function

**Modify** the `handleAnalyze` function to call component extraction and generate initial image:

```typescript
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
        const imageRes = await fetch('/api/wizard/generate-product-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productName: analyzeData.productName,
                category: analyzeData.category,
                idea,
                components: componentsResult.components,
                visualElements: componentsResult.visualElements
            })
        });

        const imageResult = await imageRes.json();
        if (!imageRes.ok) throw new Error('Image generation failed');

        setGeneratedImage(imageResult.imageUrl);
        setImagePrompt(imageResult.prompt);

        // Move to Visual Configurator (Step 2)
        setStepIndex(2);

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to analyze your idea. Please try again.');
    } finally {
        setLoading(false);
    }
}
```

---

### 5. Create New Handler: Regenerate Image

Add a function to regenerate the image when user changes components:

```typescript
async function handleRegenerateImage() {
    if (!componentsData || !analysisData) return;

    setImageGenerating(true);

    try {
        const imageRes = await fetch('/api/wizard/generate-product-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productName: analysisData.productName,
                category: analysisData.category,
                idea,
                components: componentsData.components,
                visualElements: componentsData.visualElements
            })
        });

        const imageResult = await imageRes.json();
        if (!imageRes.ok) throw new Error('Image regeneration failed');

        setGeneratedImage(imageResult.imageUrl);
        setImagePrompt(imageResult.prompt);

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
```

---

### 6. Create Visual Configurator UI (Step 2)

Add the new Step 2 rendering in the wizard modal:

```typescript
// ADD THIS NEW STEP RENDERING (after Step 1, before old Step 2)

{stepIndex === 2 && componentsData && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
    >
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">
                Customize Your {analysisData?.productName}
            </h2>
            <p className="text-zinc-600 mt-2">
                Adjust materials and features below. The image will update in real-time.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT SIDE: Product Image */}
            <div className="space-y-4">
                <div className="relative bg-zinc-50 rounded-2xl border-2 border-zinc-200 overflow-hidden aspect-square">
                    {imageGenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-zinc-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-medium text-zinc-700">Regenerating image...</p>
                            </div>
                        </div>
                    ) : null}

                    {generatedImage ? (
                        <img
                            src={generatedImage}
                            alt={analysisData?.productName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-400">
                            <p>No image generated</p>
                        </div>
                    )}
                </div>

                {/* Image Prompt (for debugging - can remove in production) */}
                {imagePrompt && (
                    <details className="text-xs text-zinc-500 bg-zinc-50 rounded-lg p-3">
                        <summary className="cursor-pointer font-medium">View Image Prompt</summary>
                        <p className="mt-2 whitespace-pre-wrap">{imagePrompt}</p>
                    </details>
                )}
            </div>

            {/* RIGHT SIDE: Component Configurator */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">

                {/* Components Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-900">Components</h3>

                    {componentsData.components.map((component) => (
                        <div
                            key={component.id}
                            className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
                        >
                            <h4 className="font-semibold text-zinc-900">{component.name}</h4>

                            {/* Material Selection */}
                            <div>
                                <label className="text-xs font-medium text-zinc-600 uppercase mb-2 block">
                                    Material
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {component.materialOptions.map((material) => (
                                        <button
                                            key={material}
                                            onClick={() => updateComponent(component.id, 'selectedMaterial', material)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                (component.selectedMaterial || component.defaultMaterial) === material
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                            }`}
                                        >
                                            {material}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Options */}
                            {Object.entries(component.featureOptions).map(([featureName, options]) => (
                                <div key={featureName}>
                                    <label className="text-xs font-medium text-zinc-600 uppercase mb-2 block">
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
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                        isSelected
                                                            ? 'bg-emerald-600 text-white shadow-md'
                                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
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
                </div>

                {/* Visual Elements Section */}
                {componentsData.visualElements && componentsData.visualElements.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-zinc-900">Visual & Branding</h3>

                        {componentsData.visualElements.map((element) => (
                            <div
                                key={element.id}
                                className="bg-white border border-zinc-200 rounded-xl p-4"
                            >
                                <label className="text-sm font-semibold text-zinc-900 mb-2 block">
                                    {element.name}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {element.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => updateVisualElement(element.id, option)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                (element.selectedOption || element.default) === option
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
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

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
            <button
                onClick={() => setStepIndex(1)}
                className="px-6 py-3 text-zinc-700 font-medium hover:bg-zinc-100 rounded-xl transition-colors"
            >
                ← Back
            </button>

            <button
                onClick={() => setStepIndex(3)} // Move to Step 3 (old Step 2)
                disabled={imageGenerating}
                className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all shadow-lg"
            >
                Continue to Confirmation →
            </button>
        </div>
    </motion.div>
)}
```

---

### 7. Update Step Indices for Old Steps

**IMPORTANT**: Update all existing step checks:

```typescript
// OLD Step 2 (Confirm) becomes Step 3
{stepIndex === 3 && analysisData && (
    // ... existing Step 2 code
    // Update button to go to Step 4 instead of 3
    <button onClick={() => setStepIndex(4)}>
        Continue →
    </button>
)}

// OLD Step 3 (Approach) becomes Step 4
{stepIndex === 4 && analysisData && (
    // ... existing Step 3 code
)}
```

---

### 8. Update ANALYSIS_STEPS Array

```typescript
const ANALYSIS_STEPS = [
    'Understanding your idea...',
    'Extracting product components...', // NEW
    'Generating product visualization...', // NEW
    'Searching for similar products...',
    'Estimating costs and timelines...',
    'Assessing manufacturability...',
];
```

---

### 9. TypeScript Types

Add new type definitions at the top of `WizardModal.tsx`:

```typescript
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
```

---

## Testing Checklist

After implementation, test the following:

- [ ] Step 1 still works (describe idea)
- [ ] "Analyze Idea" extracts components correctly
- [ ] Initial image generates successfully
- [ ] Changing material options triggers image regeneration
- [ ] Changing features triggers image regeneration
- [ ] Image shows loading state during regeneration
- [ ] "Continue" button advances to Step 3 (old Step 2)
- [ ] Step 3 and 4 still work correctly
- [ ] Final playbook generation includes component data
- [ ] Error handling works if API fails
- [ ] Mobile responsive layout

---

## Optional Enhancements

### Debounced Image Regeneration
Add a debounce function to avoid too many API calls:

```typescript
let imageRegenerationTimeout: NodeJS.Timeout;

function debouncedRegenerateImage() {
    clearTimeout(imageRegenerationTimeout);
    imageRegenerationTimeout = setTimeout(() => {
        handleRegenerateImage();
    }, 1500); // Wait 1.5 seconds after last change
}

// Use debouncedRegenerateImage() instead of setTimeout in update functions
```

### Save Component Data to Playbook
In `handleSubmitPlaybook`, add component data:

```typescript
const storedPlaybook = {
    // ... existing fields
    componentSelections: componentsData, // NEW: Save user's component choices
    productImage: generatedImage, // NEW: Save final image
    // ...
};
```

---

## Cost Considerations

**DALL-E 3 Pricing** (as of 2024):
- Standard quality (1024x1024): ~$0.04 per image
- HD quality: ~$0.08 per image

**Recommendations**:
- Use standard quality during configuration (fast, cheaper)
- Optionally offer HD quality for final download
- Cache images to avoid regenerating identical prompts
- Implement rate limiting (max 10 images per session)

---

## Alternative: Use Stable Diffusion (Cheaper)

If cost is a concern, use Stable Diffusion via Replicate or Hugging Face:

```typescript
// Using Replicate API
const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        version: 'stability-ai/sdxl:latest',
        input: {
            prompt: imagePrompt,
            num_outputs: 1
        }
    })
});
```

---

**End of Implementation Guide**

This prompt provides everything your IDE needs to implement the visual configurator. Good luck! 🚀
