import { useState, useEffect } from 'react';
import { X, Save, Lock, Unlock } from 'lucide-react';

type Prompt = {
    id?: string;
    category: string;
    name: string;
    template: string;
    description?: string;
    version?: number;
    is_frozen?: boolean;
    token_usage?: any;
};

type Props = {
    prompt: Prompt | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Prompt) => Promise<void>;
};

export default function PromptEditor({ prompt, isOpen, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Prompt>({
        category: 'wizard',
        name: '',
        template: '',
        description: '',
        version: 1,
        is_frozen: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (prompt) {
            setFormData(prompt);
        } else {
            setFormData({
                category: 'wizard',
                name: '',
                template: '',
                description: '',
                version: 1,
                is_frozen: false
            });
        }
    }, [prompt, isOpen]);

    if (!isOpen) return null;

    async function handleSave() {
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save prompt');
        } finally {
            setSaving(false);
        }
    }

    const isFrozen = formData.is_frozen;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {prompt?.id ? 'Edit AI Prompt' : 'New AI Prompt'}
                        </h2>
                        {isFrozen && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                This prompt is frozen. Unfreeze to edit.
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Category & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                disabled={isFrozen}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="wizard">Wizard</option>
                                <option value="playbook">Playbook</option>
                                <option value="components">Components</option>
                                <option value="cost_estimation">Cost Estimation</option>
                                <option value="compliance">Compliance</option>
                                <option value="matching">Matching</option>
                                <option value="qc">QC</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name (Identifier)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="wizard_questions_v1"
                                disabled={isFrozen || !!prompt?.id}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this prompt's purpose"
                            disabled={isFrozen}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Template */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prompt Template
                        </label>
                        <div className="text-xs text-gray-500 mb-2">
                            Use <code className="bg-gray-100 px-1 rounded">{'{'}variable{'}'}</code> for placeholders (e.g., {'{'}productName{'}'}, {'{'}category{'}'})
                        </div>
                        <textarea
                            rows={20}
                            value={formData.template}
                            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                            disabled={isFrozen}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
                            placeholder="You are an expert AI assistant..."
                        />
                    </div>

                    {/* Token Usage Stats */}
                    {formData.token_usage && Object.keys(formData.token_usage).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Usage Statistics</h3>
                            <pre className="text-xs text-gray-600">
                                {JSON.stringify(formData.token_usage, null, 2)}
                            </pre>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    {!isFrozen && (
                        <button
                            onClick={handleSave}
                            disabled={saving || !formData.name || !formData.template}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Prompt
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
