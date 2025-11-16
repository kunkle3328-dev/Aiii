
import React from 'react';
import { ConnectionState } from '../types';
import { MicIcon, MicOffIcon, CalendarDays, StickyNote, CheckSquare, SearchIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { ToolTab } from '../types';

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
            title={title}
            onClick={onClick} 
            className={`p-3 rounded-full transition-colors duration-200 ${active ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-gray-800/50 hover:bg-gray-700/70'}`}>
            {children}
        </button>
    )
}

export const Controls: React.FC<ControlsProps> = ({ connectionState, startSession, stopSession }) => {
    const isConnected = connectionState === 'connected';
    const isConnecting = connectionState === 'connecting';
    const { dispatch } = useAppContext();

    const handleMicClick = () => {
        if (isConnected) {
            stopSession();
        } else if (connectionState === 'disconnected' || connectionState === 'error') {
            startSession();
        }
    };

    const openTool = (tool: ToolTab) => {
        dispatch({ type: 'SET_ACTIVE_TOOL_TAB', payload: tool });
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'tasks' });
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
                <ControlButton onClick={() => openTool('calendar')} title="Calendar">
                    <CalendarDays className="w-6 h-6" />
                </ControlButton>
                <ControlButton onClick={() => openTool('notes')} title="Notes">
                    <StickyNote className="w-6 h-6" />
                </ControlButton>

                <button
                    onClick={handleMicClick}
                    disabled={isConnecting}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 bg-secondary-dark
                    ${isConnecting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    {isConnected ? <MicOffIcon className="w-10 h-10 text-gray-400" /> : <MicIcon className="w-10 h-10 text-red-500" />}
                </button>
                
                <ControlButton onClick={() => openTool('tasks')} title="Tasks">
                    <CheckSquare className="w-6 h-6" />
                </ControlButton>
                 <ControlButton onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'search' })} title="Search">
                    <SearchIcon className="w-6 h-6" />
                </ControlButton>
            </div>
        </div>
    );
};