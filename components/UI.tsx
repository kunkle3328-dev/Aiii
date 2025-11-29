
import React, { useEffect, useState } from 'react';
import { ConnectionState, TranscriptEntry, ActivePanel } from '../types';
import { Transcript } from './Transcript';
import { Controls } from './Controls';
import { ToolsPanel } from './ToolsPanel';
import { MemoryPanel } from './MemoryPanel';
import { SettingsPanel } from './SettingsPanel';
import { SearchPanel } from './SearchPanel';
import { useAppContext } from '../context/AppContext';

interface UIProps {
    connectionState: ConnectionState;
    startSession: () => void;
    stopSession: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    transcript: TranscriptEntry[];
    userAmplitude: number;
}

const ModalWrapper: React.FC<{ title: string, panelId: ActivePanel, children: React.ReactNode }> = ({ title, panelId, children }) => {
    const { state, dispatch } = useAppContext();
    const isActive = state.activePanel === panelId;
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isActive) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                 requestAnimationFrame(() => setIsVisible(true));
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Slightly faster close for responsiveness
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!shouldRender) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isVisible ? 'bg-primary/60 backdrop-blur-md opacity-100' : 'bg-transparent backdrop-blur-none opacity-0'}
            `}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: null })}
        >
            <div 
                className={`panel-glass rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg max-h-[85vh] flex flex-col border border-border-color transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${isVisible ? 'translate-y-0 scale-100 opacity-100 rotate-0' : 'translate-y-20 scale-90 opacity-0 rotate-[-2deg]'}
                `}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center p-4 border-b border-border-color bg-gradient-to-r from-white/5 to-transparent">
                    <h2 className="text-xl font-bold text-accent tracking-wide flex items-center gap-2">
                        <span className="w-2 h-6 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]"></span>
                        {title}
                    </h2>
                    <button onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: null })} title="Close Panel" className="p-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
}

export const UI: React.FC<UIProps> = (props) => {
    return (
        <div className="relative z-10 flex flex-col h-full text-text-primary pointer-events-none">
            {/* Empty div pushes controls to the bottom */}
            <div className="flex-grow" />

            <div className="w-full pt-4 px-4 pb-4 md:px-8 md:pb-8 pointer-events-auto">
                <Controls {...props} />
            </div>

            <div className="pointer-events-auto">
                <ModalWrapper title="Productivity Tools" panelId="tools">
                    <ToolsPanel />
                </ModalWrapper>
                 <ModalWrapper title="Internet Search" panelId="search">
                    <SearchPanel />
                </ModalWrapper>
                <ModalWrapper title="Neural Memory" panelId="memory">
                    <MemoryPanel />
                </ModalWrapper>
                <ModalWrapper title="System Settings" panelId="settings">
                    <SettingsPanel />
                </ModalWrapper>
            </div>
        </div>
    );
};
