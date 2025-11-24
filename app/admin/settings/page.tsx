'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Palette, Mail, DollarSign, Key, AlertCircle } from 'lucide-react';
import Toast from '@/components/admin/Toast';

type PricingTier = {
    name: string;
    price: number;
    features: string[];
};

type Settings = {
    id: string;
    system_name: string;
    logo_url: string | null;
    primary_color: string;
    accent_color: string;
    support_email: string;
    pricing_tiers: PricingTier[];
    api_keys: Record<string, string>;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch settings');
            }

            if (data.settings) {
                setSettings(data.settings);
            } else {
                throw new Error('No settings data returned');
            }
        } catch (error: any) {
            console.error('Failed to fetch settings:', error);
            setLoadError(error.message || 'Failed to load settings');
            setToast({ type: 'error', message: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!settings) return;

        // Validate
        const newErrors: Record<string, string> = {};

        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(settings.support_email)) {
            newErrors.support_email = 'Invalid email format';
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(settings.primary_color)) {
            newErrors.primary_color = 'Invalid hex color (use #RRGGBB)';
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(settings.accent_color)) {
            newErrors.accent_color = 'Invalid hex color (use #RRGGBB)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setToast({ type: 'error', message: 'Please fix validation errors' });
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            const data = await res.json();
            setSettings(data.settings);
            setToast({ type: 'success', message: 'Settings saved successfully!' });
        } catch (error: any) {
            console.error('Save failed:', error);
            setToast({ type: 'error', message: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    }

    function updateSettings(key: keyof Settings, value: any) {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    }

    function addPricingTier() {
        if (!settings) return;
        const newTier: PricingTier = { name: 'New Tier', price: 0, features: [] };
        updateSettings('pricing_tiers', [...settings.pricing_tiers, newTier]);
    }

    function updatePricingTier(index: number, field: keyof PricingTier, value: any) {
        if (!settings) return;
        const updated = [...settings.pricing_tiers];
        updated[index] = { ...updated[index], [field]: value };
        updateSettings('pricing_tiers', updated);
    }

    function removePricingTier(index: number) {
        if (!settings) return;
        const updated = settings.pricing_tiers.filter((_, i) => i !== index);
        updateSettings('pricing_tiers', updated);
    }

    function updateApiKey(key: string, value: string) {
        if (!settings) return;
        updateSettings('api_keys', { ...settings.api_keys, [key]: value });
    }

    const tabs = [
        { id: 'general', label: 'General', icon: <Palette className="w-4 h-4" /> },
        { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
        { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading settings...</div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Configure global platform settings and preferences.</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-900">Failed to Load Settings</h3>
                            <p className="mt-2 text-sm text-red-800">{loadError}</p>
                            <p className="mt-3 text-sm text-red-700">
                                This is likely because the <code className="bg-red-100 px-1 rounded">platform_settings</code> table hasn't been created yet.
                            </p>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-red-900 mb-2">To fix this:</p>
                                <ol className="list-decimal list-inside text-sm text-red-800 space-y-1">
                                    <li>Open Supabase SQL Editor</li>
                                    <li>Run the migration: <code className="bg-red-100 px-1 rounded">supabase/migrations/create_platform_settings_table.sql</code></li>
                                    <li>Refresh this page</li>
                                </ol>
                            </div>
                            <button
                                onClick={fetchSettings}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">No settings found</div>
            </div>
        );
    }
    return (
        <div className="space-y-6 pb-20">
            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Configure global platform settings and preferences.
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-semibold">Changes apply platform-wide immediately.</p>
                    <p className="mt-1">Test thoroughly before saving critical settings like pricing tiers or API keys.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                            <input
                                type="text"
                                value={settings.system_name}
                                onChange={(e) => updateSettings('system_name', e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                            <input
                                type="text"
                                value={settings.logo_url || ''}
                                onChange={(e) => updateSettings('logo_url', e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={settings.primary_color}
                                        onChange={(e) => updateSettings('primary_color', e.target.value)}
                                        className="h-10 w-16 rounded border-gray-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primary_color}
                                        onChange={(e) => updateSettings('primary_color', e.target.value)}
                                        className={`flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm ${errors.primary_color ? 'border-red-300' : ''
                                            }`}
                                    />
                                </div>
                                {errors.primary_color && (
                                    <p className="mt-1 text-sm text-red-600">{errors.primary_color}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={settings.accent_color}
                                        onChange={(e) => updateSettings('accent_color', e.target.value)}
                                        className="h-10 w-16 rounded border-gray-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.accent_color}
                                        onChange={(e) => updateSettings('accent_color', e.target.value)}
                                        className={`flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm ${errors.accent_color ? 'border-red-300' : ''
                                            }`}
                                    />
                                </div>
                                {errors.accent_color && (
                                    <p className="mt-1 text-sm text-red-600">{errors.accent_color}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                            <input
                                type="email"
                                value={settings.support_email}
                                onChange={(e) => updateSettings('support_email', e.target.value)}
                                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.support_email ? 'border-red-300' : ''
                                    }`}
                            />
                            {errors.support_email && (
                                <p className="mt-1 text-sm text-red-600">{errors.support_email}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">Email address for customer support inquiries</p>
                        </div>
                    </div>
                )}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Pricing Tiers</h3>
                            <button
                                onClick={addPricingTier}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Tier
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.pricing_tiers.map((tier, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                                                className="w-full rounded border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updatePricingTier(index, 'price', parseFloat(e.target.value))}
                                                className="w-full rounded border-gray-300 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => removePricingTier(index)}
                                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Features (one per line)</label>
                                        <textarea
                                            rows={3}
                                            value={tier.features.join('\n')}
                                            onChange={(e) => updatePricingTier(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                                            className="w-full rounded border-gray-300 text-sm font-mono"
                                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Keys Tab */}
                {activeTab === 'api' && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">
                            API keys are masked for security. Only update keys that need to be changed.
                        </p>

                        {Object.entries(settings.api_keys).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type={showApiKeys[key] ? 'text' : 'password'}
                                        value={value}
                                        onChange={(e) => updateApiKey(key, e.target.value)}
                                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => setShowApiKeys({ ...showApiKeys, [key]: !showApiKeys[key] })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        {showApiKeys[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fixed Footer with Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-lg">
                <button
                    onClick={() => fetchSettings()}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={saving}
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        'Saving...'
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
