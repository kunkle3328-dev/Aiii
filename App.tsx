
import React, { useState, useEffect } from 'react';
import { AvatarCanvas } from './components/AvatarCanvas';
import { UI } from './components/UI';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useAppContext } from './context/AppContext';
import { LoadingSplash } from './components/LoadingSplash';

export default function App() {
    const { state } = useAppContext();
    const { theme } = state.settings;
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");

    const {
        connectionState,
        startSession,
        stopSession,
        isMuted,
        toggleMute,
        transcript,
        userAmplitude,
        modelAmplitude
    } = useGeminiLive();

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    useEffect(() => {
        const loadingSteps = [
            "Booting multi-agent core...",
            "Loading MetaHuman avatar...",
            "Calibrating lip-sync engine...",
            "Initializing memory matrix...",
            "Ready."
        ];
        let step = 0;
        const interval = setInterval(() => {
            if (step < loadingSteps.length) {
                setLoadingMessage(loadingSteps[step]);
                step++;
            } else {
                clearInterval(interval);
                setIsLoading(false);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <LoadingSplash message={loadingMessage} />;
    }

    return (
        <main className="w-screen h-screen overflow-hidden bg-primary-dark dark:bg-primary-dark flex flex-col font-sans">
            <div className="relative flex-none h-[50vh]">
                 <div className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none">
                    <h1 className="text-4xl font-bold tracking-wider">AURA</h1>
                    <p className="text-lg text-gray-400">Your Personal AI Companion</p>
                </div>
                <AvatarCanvas 
                    modelAmplitude={modelAmplitude}
                    userSpeaking={userAmplitude > 0.05}
                    connectionState={connectionState}
                />
            </div>
            <div className="relative flex-grow">
                <UI 
                    connectionState={connectionState}
                    startSession={startSession}
                    stopSession={stopSession}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    transcript={transcript}
                    userAmplitude={userAmplitude}
                />
            </div>
        </main>
    );
}
