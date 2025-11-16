
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id:string;
  title: string;
  start: string;
  end: string;
}

export interface Memory {
  profile: {
    name: string;
    interests: string[];
  };
  preferences: {
    theme: 'dark' | 'light' | 'cyberpunk';
    voice: string;
  };
  projects: { name: string; goals: string[] }[];
  pastConversations: string[];
}

export interface Settings {
    theme: 'light' | 'dark' | 'cyberpunk' | 'holographic';
    avatarStyle: string;
    continuousListening: boolean;
    voice: string;
    voiceSpeed: number;
    voicePitch: number;
}

export interface TranscriptEntry {
    id: string;
    speaker: 'user' | 'model';
    text: string;
    timestamp: number;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type ActivePanel = 'tasks' | 'calendar' | 'notes' | 'search' | 'memory' | 'settings' | null;

export type ToolTab = 'tasks' | 'calendar' | 'notes';

// AppContext related types
export interface AppState {
    tasks: Task[];
    notes: Note[];
    calendarEvents: CalendarEvent[];
    memory: Memory;
    settings: Settings;
    activePanel: ActivePanel;
    activeToolTab: ToolTab;
}

export type AppAction =
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'TOGGLE_TASK'; payload: string }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'ADD_NOTE'; payload: Note }
    | { type: 'UPDATE_NOTE'; payload: Note }
    | { type: 'DELETE_NOTE'; payload: string }
    | { type: 'ADD_EVENT'; payload: CalendarEvent }
    | { type: 'UPDATE_MEMORY'; payload: Partial<Memory> }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
    | { type: 'SET_ACTIVE_PANEL'; payload: ActivePanel }
    | { type: 'SET_ACTIVE_TOOL_TAB'; payload: ToolTab }
    | { type: 'LOAD_STATE'; payload: AppState };
