import React from 'react';
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

const PanelWrapper: React.FC<{ title: string, panelId: ActivePanel, children: React.ReactNode }> = ({ title, panelId, children }) => {
    const { state, dispatch } = useAppContext();
    const isVisible = state.activePanel === panelId;

    return (
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-secondary-dark/80 backdrop-blur-md shadow-2xl transition-transform duration-500 ease-in-out transform ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-accent-cyan">{title}</h2>
                <button onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: null })} className="p-2 rounded-full hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {children}
            </div>
        </div>
    );
}

export const UI: React.FC<UIProps> = (props) => {
    const { state } = useAppContext();

    return (
        <div className="relative z-10 flex flex-col h-full text-white pointer-events-none">
            {/* Empty div pushes controls to the bottom */}
            <div className="flex-grow" />

            <div className="w-full pt-4 px-4 pb-4 md:px-8 md:pb-8 pointer-events-auto">
                <Controls {...props} />
            </div>

            <div className="pointer-events-auto">
                <PanelWrapper title="Tools" panelId="tasks">
                    <ToolsPanel />
                </PanelWrapper>
                 <PanelWrapper title="Search Results" panelId="search">
                    <SearchPanel />
                </PanelWrapper>
                <PanelWrapper title="Long-Term Memory" panelId="memory">
                    <MemoryPanel />
                </PanelWrapper>
                <PanelWrapper title="Settings" panelId="settings">
                    <SettingsPanel />
                </PanelWrapper>
            </div>
        </div>
    );
};