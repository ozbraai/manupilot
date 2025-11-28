'use client';

import { useEffect } from 'react';
import { WizardProvider, useWizard } from '@/components/wizard/WizardContext';
import WizardModal from '@/components/wizard/WizardModal';

function WizardTrigger() {
  const { openWizard } = useWizard();

  useEffect(() => {
    openWizard();
  }, [openWizard]);

  return null;
}

export default function PlaybookWizardPage() {
  return (
    <WizardProvider>
      <WizardTrigger />
      <WizardModal />
    </WizardProvider>
  );
}
