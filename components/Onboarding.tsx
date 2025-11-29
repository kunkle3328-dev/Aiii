
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MicIcon, BrainCircuitIcon, AppWindowIcon } from './icons';

export const Onboarding: React.FC = () => {
    const { dispatch } = useAppContext();
    const [step, setStep] = useState(1);

    const handleNext = () => setStep(step + 1);
    const handleComplete = () => {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                            <h1 className="text-4xl">👋</h1>
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary">Welcome to AURA</h2>
                        <p className="text-text-secondary">Your ultra-realistic, conversational AI co-founder and product strategist.</p>
                        <button onClick={handleNext} className="w-full bg-accent text-primary-dark font-bold py-3 rounded-lg hover:bg-accent-hover transition-colors">
                            Get Started
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                            <MicIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Voice & Interaction</h2>
                        <p className="text-text-secondary">Aura works best with voice. She listens continuously and can be interrupted naturally, just like a real person.</p>
                        <button onClick={handleNext} className="w-full bg-secondary border border-accent text-accent font-bold py-3 rounded-lg hover:bg-accent/10 transition-colors">
                            Continue
                        </button>
                    </div>
                )}

                {step === 3 && (
                     <div className="space-y-6 animate-slide-up">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                            <AppWindowIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Productivity & Studio</h2>
                        <p className="text-text-secondary">Manage tasks, events, and notes in the Tools panel. Use the new <b>AI Studio</b> to generate code, summarize text, or write creative content instantly.</p>
                        <button onClick={handleNext} className="w-full bg-secondary border border-accent text-accent font-bold py-3 rounded-lg hover:bg-accent/10 transition-colors">
                            Next
                        </button>
                    </div>
                )}

                 {step === 4 && (
                     <div className="space-y-6 animate-slide-up">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                            <BrainCircuitIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Long-Term Memory</h2>
                        <p className="text-text-secondary">Aura remembers your projects and preferences across sessions. You can view and edit her brain in the Memory panel.</p>
                        <button onClick={handleComplete} className="w-full bg-accent text-primary-dark font-bold py-3 rounded-lg hover:bg-accent-hover transition-colors">
                            Enter Aura
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
