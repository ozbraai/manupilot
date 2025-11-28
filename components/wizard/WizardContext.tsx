'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { NdaConsentModal } from '@/components/NdaConsentModal';

type WizardContextType = {
    isOpen: boolean;
    isNdaSigned: boolean;
    openWizard: () => void;
    closeWizard: () => void;
    openNdaModal: () => void;
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isNdaSigned, setIsNdaSigned] = useState(false);
    const [showNda, setShowNda] = useState(false);

    const openWizard = async () => {
        try {
            const res = await fetch('/api/nda/status');
            if (res.ok) {
                const data = await res.json();
                if (data.hasSigned) {
                    setIsNdaSigned(true);
                    setIsOpen(true);
                } else {
                    setShowNda(true);
                }
            } else {
                // Fallback if API fails: just open wizard
                setIsOpen(true);
            }
        } catch (e) {
            console.error('Failed to check NDA status', e);
            setIsOpen(true);
        }
    };

    const closeWizard = () => setIsOpen(false);
    const openNdaModal = () => setShowNda(true);

    return (
        <WizardContext.Provider value={{ isOpen, isNdaSigned, openWizard, closeWizard, openNdaModal }}>
            {children}
            <NdaConsentModal
                isOpen={showNda}
                onClose={() => {
                    setShowNda(false);
                    // Soft requirement: proceed to wizard even if skipped/closed
                    setIsOpen(true);
                }}
                onAccepted={() => {
                    setIsNdaSigned(true);
                    // NDA accepted
                }}
            />
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
