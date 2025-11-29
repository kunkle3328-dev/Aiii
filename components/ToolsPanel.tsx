
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Note, ToolTab } from '../types';
import { CheckSquare, Trash2, Plus, CalendarDays, StickyNote, CodeIcon, FileTextIcon, PenToolIcon, BrainCircuitIcon } from './icons';
import { useAgentRouter } from '../hooks/useAgentRouter';

const TasksTool: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [newTaskText, setNewTaskText] = React.useState('');

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            const newTask: Task = {
                id: crypto.randomUUID(),
                text: newTaskText.trim(),
                completed: false,
                createdAt: new Date().toISOString()
            };
            dispatch({ type: 'ADD_TASK', payload: newTask });
            setNewTaskText('');
        }
    };
    
    return <div>
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a new task..."
                className="flex-grow bg-tertiary border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={handleAddTask} className="bg-accent text-primary-dark p-2 rounded-lg"><Plus className="w-5 h-5"/></button>
        </div>
        <ul className="space-y-2">
            {state.tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between bg-tertiary p-2 rounded-lg">
                    <span className={`flex-grow ${task.completed ? 'line-through text-text-secondary' : ''}`}>{task.text}</span>
                    <div className="flex gap-2">
                        <button onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })} className="text-green-500"><CheckSquare className="w-5 h-5"/></button>
                        <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="text-red-500"><Trash2 className="w-5 h-5"/></button>
                    </div>
                </li>
            ))}
        </ul>
    </div>;
};

const CalendarTool: React.FC = () => {
    const { state } = useAppContext();
    return <div>
        <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
        <ul className="space-y-2">
            {state.calendarEvents.map(event => (
                <li key={event.id} className="bg-tertiary p-3 rounded-lg">
                    <p className="font-bold">{event.title}</p>
                    <p className="text-sm text-text-secondary">{new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}</p>
                </li>
            ))}
        </ul>
    </div>;
};

const NotesTool: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const handleAddNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: "New Note",
            content: "",
            tags: [],
            createdAt: new Date().toISOString()
        };
        dispatch({type: 'ADD_NOTE', payload: newNote});
    }
    return <div>
        <button onClick={handleAddNote} className="w-full bg-accent text-primary-dark p-2 rounded-lg mb-4 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Create New Note
        </button>
        <div className="space-y-3">
            {state.notes.map(note => (
                 <div key={note.id} className="bg-tertiary p-3 rounded-lg">
                    <input 
                      type="text" 
                      value={note.title} 
                      onChange={(e) => dispatch({type: 'UPDATE_NOTE', payload: {...note, title: e.target.value}})}
                      className="bg-transparent font-bold w-full mb-2 focus:outline-none"
                    />
                    <textarea 
                      value={note.content} 
                      onChange={(e) => dispatch({type: 'UPDATE_NOTE', payload: {...note, content: e.target.value}})}
                      className="bg-transparent w-full text-sm text-text-secondary h-24 resize-none focus:outline-none custom-scrollbar"
                      placeholder="Your note..."
                    />
                </div>
            ))}
        </div>
    </div>;
};

const StudioTool: React.FC = () => {
    const [mode, setMode] = useState<'code' | 'summarize' | 'write'>('code');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const { generateCode, summarizeContent, creativeWrite } = useAgentRouter();

    const handleAction = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setOutput('');
        let result = '';
        if (mode === 'code') result = await generateCode(input);
        if (mode === 'summarize') result = await summarizeContent(input);
        if (mode === 'write') result = await creativeWrite(input);
        setOutput(result);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-4 border-b border-border-color pb-2">
                <button onClick={() => setMode('code')} className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm ${mode === 'code' ? 'bg-accent/20 text-accent' : 'text-text-secondary'}`}><CodeIcon className="w-4 h-4"/> Code</button>
                <button onClick={() => setMode('summarize')} className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm ${mode === 'summarize' ? 'bg-accent/20 text-accent' : 'text-text-secondary'}`}><FileTextIcon className="w-4 h-4"/> Summary</button>
                <button onClick={() => setMode('write')} className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm ${mode === 'write' ? 'bg-accent/20 text-accent' : 'text-text-secondary'}`}><PenToolIcon className="w-4 h-4"/> Write</button>
            </div>
            
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'code' ? 'Describe the code you need...' : mode === 'summarize' ? 'Paste text to summarize...' : 'Enter a writing prompt...'}
                className="w-full h-24 bg-tertiary border border-border-color rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none custom-scrollbar mb-4"
            />
            
            <button
                onClick={handleAction}
                disabled={loading}
                className="w-full bg-accent text-primary-dark font-bold py-2 rounded-lg mb-4 hover:bg-accent-hover disabled:opacity-50"
            >
                {loading ? 'Generating...' : 'Generate'}
            </button>

            {output && (
                <div className="flex-grow bg-tertiary/50 border border-border-color rounded-lg p-3 overflow-auto custom-scrollbar">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{output}</pre>
                </div>
            )}
        </div>
    );
};


const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    return (
        <button onClick={onClick} className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 p-2 transition-colors text-xs whitespace-nowrap ${active ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}>
            {children}
        </button>
    )
}

export const ToolsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { activeToolTab } = state;
    
    const setActiveTab = (tab: ToolTab) => {
        dispatch({ type: 'SET_ACTIVE_TOOL_TAB', payload: tab });
    };

    const renderContent = () => {
        switch (activeToolTab) {
            case 'tasks': return <TasksTool />;
            case 'calendar': return <CalendarTool />;
            case 'notes': return <NotesTool />;
            case 'studio': return <StudioTool />;
            default: return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b border-border-color mb-4 overflow-x-auto no-scrollbar">
                <TabButton active={activeToolTab === 'tasks'} onClick={() => setActiveTab('tasks')}><CheckSquare className="w-5 h-5"/> Tasks</TabButton>
                <TabButton active={activeToolTab === 'calendar'} onClick={() => setActiveTab('calendar')}><CalendarDays className="w-5 h-5"/> Calendar</TabButton>
                <TabButton active={activeToolTab === 'notes'} onClick={() => setActiveTab('notes')}><StickyNote className="w-5 h-5"/> Notes</TabButton>
                <TabButton active={activeToolTab === 'studio'} onClick={() => setActiveTab('studio')}><BrainCircuitIcon className="w-5 h-5"/> Studio</TabButton>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};
