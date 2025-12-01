import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface QuestionsListProps {
    questions: string[];
    onUpdate: (questions: string[]) => void;
}

export default function QuestionsList({ questions, onUpdate }: QuestionsListProps) {
    const [newQuestion, setNewQuestion] = useState('');

    const handleAdd = () => {
        if (newQuestion.trim()) {
            onUpdate([...questions, newQuestion.trim()]);
            setNewQuestion('');
        }
    };

    const handleRemove = (index: number) => {
        onUpdate(questions.filter((_, i) => i !== index));
    };

    const defaultQuestions = [
        "Please itemize Tooling Costs (NRE) separately from Unit Price",
        "What is the estimated mold life (shots) and steel grade?",
        "Do you have in-house injection molding or do you outsource?"
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">3</div>
                <h3 className="text-lg font-bold text-slate-900">Additional Questions</h3>
            </div>

            <p className="text-sm text-slate-500 mb-4">
                Add specific technical questions you need answered by the supplier.
            </p>

            <div className="space-y-3 mb-4">
                {questions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group">
                        <span className="text-slate-400 mt-0.5">◆</span>
                        <span className="flex-1 text-sm text-slate-700">{q}</span>
                        <button
                            onClick={() => handleRemove(idx)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Add a specific question..."
                    className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newQuestion.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add
                </button>
            </div>
        </div>
    );
}
