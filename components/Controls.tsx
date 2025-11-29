
import React from 'react';
import { ConnectionState } from '../types';
import { MicIcon, MicOffIcon, AppWindowIcon, BrainCircuitIcon, SlidersIcon, SearchIcon, DownloadIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { usePWA } from '../hooks/usePWA';

interface ControlsProps {
    connectionState: ConnectionState;
    startSession: () => void;
    stopSession: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    userAmplitude: number;
}

const ControlButton: React.FC<{ onClick: () => void, children: React.ReactNode, active?: boolean, title: string }> = ({ onClick, children, active, title }) => {
    return (
        <button 
            onClick={onClick} 
            title={title}
            className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 ${active ? 'bg-accent/20 text-accent ring-2 ring-accent/50' : 'bg-secondary/50 hover:bg-tertiary/70 text-text-primary'}`}>
            {children}
        </button>
    )
}

export const Controls: React.FC<ControlsProps> = ({ connectionState, startSession, stopSession }) => {
    const isConnected = connectionState === 'connected';
    const isConnecting = connectionState === 'connecting';
    const { dispatch } = useAppContext();
    const { isInstallable, installApp } = usePWA();

    const handleMicClick = () => {
        if (isConnected) {
            stopSession();
        } else if (connectionState === 'disconnected' || connectionState === 'error') {
            startSession();
        }
    };

    const openTools = () => {
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'tools' });
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4 bg-black/20 p-4 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                 <ControlButton onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'search' })} title="Internet Search">
                    <SearchIcon className="w-6 h-6" />
                </ControlButton>
                <ControlButton onClick={openTools} title="Productivity Tools">
                    <AppWindowIcon className="w-6 h-6" />
                </ControlButton>

                <button
                    onClick={handleMicClick}
                    disabled={isConnecting}
                    title={isConnected ? "Disconnect Voice" : "Start Voice Chat"}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(0,255,255,0.2)] border-4 
                    ${isConnecting ? 'cursor-not-allowed opacity-50 bg-gray-600 border-gray-500' : ''}
                    ${isConnected ? 'bg-red-500/90 hover:bg-red-500 border-red-400 animate-pulse' : 'bg-accent/90 hover:bg-accent border-accent-secondary'}`}
                >
                    {isConnected ? <MicIcon className="w-10 h-10 text-white" /> : <MicOffIcon className="w-10 h-10 text-primary-dark" />}
                </button>
                
                 <ControlButton onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'memory' })} title="Long-Term Memory">
                    <BrainCircuitIcon className="w-6 h-6" />
                </ControlButton>
                 <ControlButton onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'settings' })} title="Settings & Customization">
                    <SlidersIcon className="w-6 h-6" />
                </ControlButton>
                
                {isInstallable && (
                    <ControlButton onClick={installApp} title="Install App on Device">
                        <DownloadIcon className="w-6 h-6 text-accent animate-pulse" />
                    </ControlButton>
                )}
            </div>
        </div>
    );
};
