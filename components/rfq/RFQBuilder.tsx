'use client';

import React, { useState } from 'react';
import CategoryTips from './CategoryTips';
import TechSpecsInput from './TechSpecsInput';
import MessageEditor from './MessageEditor';
import QuestionsList from './QuestionsList';
import RFQPreview from './RFQPreview';

interface RFQBuilderProps {
    projectId: string;
    projectTitle: string;
    sourcingMode: string;
    bomCount: number;
    targetPrice: string;
    targetMoq: string;
    playbook?: any;
    onSuccess: () => void;
}

export default function RFQBuilder({
    projectId,
    projectTitle,
    sourcingMode,
    bomCount,
    targetPrice,
    targetMoq,
    playbook,
    onSuccess
}: RFQBuilderProps) {
    const [rfqData, setRfqData] = useState({
        category: playbook?.category || 'General',
        specs: {
            materials: playbook?.specifications?.materials || [],
            dimensions: playbook?.specifications?.dimensions || '',
            weight: playbook?.specifications?.weight || '',
            features: playbook?.specifications?.features || []
        },
        message: `Hi,\n\nI am the Purchasing Manager for a new project. We are looking for a factory to produce a ${playbook?.category || 'product'}: ${projectTitle}.\n\nKey Specifications:\n- Product: ${projectTitle}\n- Category: ${playbook?.category || 'General'}\n- Target MOQ: ${targetMoq}`,
        questions: [
            "Please itemize Tooling Costs (NRE) separately from Unit Price",
            "What is the estimated mold life (shots) and steel grade?",
            "Do you have in-house injection molding or do you outsource?"
        ]
    });

    const updateSpecs = (newSpecs: any) => setRfqData({ ...rfqData, specs: newSpecs });
    const updateMessage = (newMessage: string) => setRfqData({ ...rfqData, message: newMessage });
    const updateQuestions = (newQuestions: string[]) => setRfqData({ ...rfqData, questions: newQuestions });

    return (
        <div className="space-y-8">
            {/* 1. Category Tips */}
            <CategoryTips category={rfqData.category} />

            {/* 2. Technical Specs */}
            <TechSpecsInput specs={rfqData.specs} onUpdate={updateSpecs} />

            {/* 3. Message & Summary */}
            <MessageEditor
                message={rfqData.message}
                onUpdate={updateMessage}
                projectTitle={projectTitle}
                category={rfqData.category}
            />

            {/* 4. Questions */}
            <QuestionsList questions={rfqData.questions} onUpdate={updateQuestions} />

            {/* 5. Preview */}
            <RFQPreview rfq={rfqData} projectTitle={projectTitle} />
        </div>
    );
}
