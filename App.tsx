
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
        <main className="relative w-screen h-screen overflow-hidden bg-primary-dark dark:bg-primary-dark font-sans">
            {/* Avatar and Title in the background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-8 left-0 right-0 z-10 text-center pointer-events-none">
                    <h1 className="text-4xl font-bold tracking-wider">AURA</h1>
                    <p className="text-lg text-gray-400">Your Personal AI Companion</p>
                </div>
                <AvatarCanvas 
                    modelAmplitude={modelAmplitude}
                    userSpeaking={userAmplitude > 0.05}
                    connectionState={connectionState}
                />
            </div>

            {/* UI on top with a gradient fade */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-primary-dark via-primary-dark/90 to-transparent" />
                <div className="relative w-full max-h-[70vh] flex flex-col">
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
            </div>
        </main>
    );
}
