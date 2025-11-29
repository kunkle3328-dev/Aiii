
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Note, ToolTab, CalendarEvent } from '../types';
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
            <button onClick={handleAddTask} title="Add Task" className="bg-accent text-primary-dark p-2 rounded-lg hover:bg-accent-hover transition-colors"><Plus className="w-5 h-5"/></button>
        </div>
        <ul className="space-y-2">
            {state.tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between bg-tertiary p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className={`flex-grow ${task.completed ? 'line-through text-text-secondary' : ''}`}>{task.text}</span>
                    <div className="flex gap-2">
                        <button onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })} title={task.completed ? "Mark Incomplete" : "Mark Complete"} className="text-green-500 hover:text-green-400"><CheckSquare className="w-5 h-5"/></button>
                        <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} title="Delete Task" className="text-red-500 hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
                    </div>
                </li>
            ))}
        </ul>
    </div>;
};

const CalendarTool: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleAddEvent = () => {
        if (title && start && end) {
            const newEvent: CalendarEvent = {
                id: crypto.randomUUID(),
                title,
                start,
                end
            };
            dispatch({ type: 'ADD_EVENT', payload: newEvent });
            setTitle('');
            setStart('');
            setEnd('');
            setShowForm(false);
        }
    };

    return <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <button 
                onClick={() => setShowForm(!showForm)} 
                title="Add New Event"
                className="bg-accent text-primary-dark p-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
                <Plus className="w-5 h-5"/>
            </button>
        </div>

        {showForm && (
            <div className="bg-tertiary p-3 rounded-lg mb-4 space-y-3 animate-slide-up border border-border-color">
                <input 
                    type="text" 
                    placeholder="Event Title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-primary/50 border border-border-color rounded px-2 py-1 focus:ring-2 focus:ring-accent outline-none"
                />
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-text-secondary block mb-1">Start</label>
                        <input 
                            type="datetime-local" 
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="w-full bg-primary/50 border border-border-color rounded px-2 py-1 text-xs focus:ring-2 focus:ring-accent outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-text-secondary block mb-1">End</label>
                        <input 
                            type="datetime-local" 
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="w-full bg-primary/50 border border-border-color rounded px-2 py-1 text-xs focus:ring-2 focus:ring-accent outline-none"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleAddEvent}
                    className="w-full bg-accent/20 text-accent font-bold py-2 rounded hover:bg-accent/30 transition-colors"
                >
                    Save Event
                </button>
            </div>
        )}

        {state.calendarEvents.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-4">No upcoming events.</p>
        ) : (
            <ul className="space-y-2">
                {state.calendarEvents.map(event => (
                    <li key={event.id} className="bg-tertiary p-3 rounded-lg border border-transparent hover:border-border-color transition-colors">
                        <p className="font-bold text-accent">{event.title}</p>
                        <p className="text-sm text-text-secondary">
                            {new Date(event.start).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})} 
                            {' - '} 
                            {new Date(event.end).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </li>
                ))}
            </ul>
        )}
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
        <button onClick={handleAddNote} title="Create a new blank note" className="w-full bg-accent text-primary-dark p-2 rounded-lg mb-4 flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors font-bold">
            <Plus className="w-5 h-5" /> Create New Note
        </button>
        <div className="space-y-3">
            {state.notes.map(note => (
                 <div key={note.id} className="bg-tertiary p-3 rounded-lg border border-transparent hover:border-border-color transition-colors group">
                    <div className="flex justify-between items-start">
                        <input 
                          type="text" 
                          value={note.title} 
                          onChange={(e) => dispatch({type: 'UPDATE_NOTE', payload: {...note, title: e.target.value}})}
                          className="bg-transparent font-bold w-full mb-2 focus:outline-none focus:text-accent transition-colors"
                        />
                        <button onClick={() => dispatch({type: 'DELETE_NOTE', payload: note.id})} title="Delete Note" className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                    <textarea 
                      value={note.content} 
                      onChange={(e) => dispatch({type: 'UPDATE_NOTE', payload: {...note, content: e.target.value}})}
                      className="bg-transparent w-full text-sm text-text-secondary h-24 resize-none focus:outline-none custom-scrollbar"
                      placeholder="Start typing..."
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

    const quickStarts = [
        { label: 'Blog Outline', text: 'Generate a blog post outline for: ', mode: 'write' },
        { label: 'Python Func', text: 'Create a Python function that ', mode: 'code' },
        { label: 'Marketing Email', text: 'Write a marketing email promoting ', mode: 'write' },
        { label: 'React Comp', text: 'Write a functional React component that ', mode: 'code' },
        { label: 'Summarize', text: 'Summarize this text concisely: ', mode: 'summarize' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-4 border-b border-border-color pb-2">
                <button onClick={() => setMode('code')} title="Generate Code Snippets" className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm transition-colors ${mode === 'code' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary'}`}><CodeIcon className="w-4 h-4"/> Code</button>
                <button onClick={() => setMode('summarize')} title="Summarize Long Text" className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm transition-colors ${mode === 'summarize' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary'}`}><FileTextIcon className="w-4 h-4"/> Summary</button>
                <button onClick={() => setMode('write')} title="Creative Writing Help" className={`p-2 rounded flex-1 flex justify-center items-center gap-1 text-xs sm:text-sm transition-colors ${mode === 'write' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary'}`}><PenToolIcon className="w-4 h-4"/> Write</button>
            </div>
            
            <div className="mb-3">
                 <p className="text-[10px] text-text-secondary mb-2 uppercase font-bold tracking-wider opacity-70">Quick Start</p>
                 <div className="flex flex-wrap gap-2">
                    {quickStarts.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setMode(t.mode as any);
                                setInput(t.text);
                            }}
                            className="text-[10px] sm:text-xs bg-tertiary hover:bg-white/10 border border-border-color/50 hover:border-accent/50 rounded-full px-3 py-1 transition-all"
                        >
                            {t.label}
                        </button>
                    ))}
                 </div>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'code' ? 'Describe the code you need...' : mode === 'summarize' ? 'Paste text to summarize...' : 'Enter a writing prompt...'}
                className="w-full h-24 bg-tertiary border border-border-color rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none custom-scrollbar mb-4 transition-all"
            />
            
            <button
                onClick={handleAction}
                disabled={loading}
                className="w-full bg-accent text-primary-dark font-bold py-2 rounded-lg mb-4 hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
                {loading ? 'Generating...' : 'Generate'}
            </button>

            {output && (
                <div className="flex-grow bg-tertiary/50 border border-border-color rounded-lg p-3 overflow-auto custom-scrollbar animate-fade-in">
                    <pre className="text-xs font-mono whitespace-pre-wrap select-text">{output}</pre>
                </div>
            )}
        </div>
    );
};


const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; tooltip: string }> = ({ active, onClick, children, tooltip }) => {
    return (
        <button onClick={onClick} title={tooltip} className={`flex-1 min-w-[70px] shrink-0 flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300 text-xs whitespace-nowrap border-b-2 ${active ? 'text-accent border-accent bg-accent/5' : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5'}`}>
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
            <div className="flex border-b border-border-color mb-4 overflow-x-auto custom-scrollbar pb-1">
                <TabButton active={activeToolTab === 'tasks'} onClick={() => setActiveTab('tasks')} tooltip="Manage To-Do List"><CheckSquare className="w-5 h-5"/> Tasks</TabButton>
                <TabButton active={activeToolTab === 'calendar'} onClick={() => setActiveTab('calendar')} tooltip="Schedule & Events"><CalendarDays className="w-5 h-5"/> Calendar</TabButton>
                <TabButton active={activeToolTab === 'notes'} onClick={() => setActiveTab('notes')} tooltip="Quick Notes"><StickyNote className="w-5 h-5"/> Notes</TabButton>
                <TabButton active={activeToolTab === 'studio'} onClick={() => setActiveTab('studio')} tooltip="AI Creation Tools"><BrainCircuitIcon className="w-5 h-5"/> Studio</TabButton>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-1">
                {renderContent()}
            </div>
        </div>
    );
};
