
import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Memory, Settings, ToolTab } from '../types';

const defaultMemory: Memory = {
  "profile": {
    "name": "Corey",
    "role": "Entrepreneur",
    "company": "EDC Media",
    "brands": [
      "Aura AI",
      "VelocityAI",
      "EDC Media Digital Products"
    ],
    "interests": [
      "AI agents",
      "AI app builders",
      "live conversational AI",
      "digital product marketplaces",
      "PLR/MRR licensing",
      "no-code and low-code tools",
      "mobile app design",
      "cyberpunk and glassmorphism UI",
      "marketing automation"
    ]
  },
  "preferences": {
    "tone": "friendly, confident, direct, slightly opinionated, respectful",
    "responseStyle": "detailed but practical, step-by-step when needed, focused on monetization and implementation",
    "formatting": {
      "useSections": true,
      "useBullets": true,
      "showActionSteps": true,
      "prioritizeExamples": true
    },
    "aiVoice": {
      "style": "human-like, engaging, natural",
      "pace": "balanced",
      "emotion": "confident, calm, supportive"
    },
    "devFocus": {
      "stack": [
        "AI Studio",
        "Gemini 2.5 Pro",
        "Gemini Live",
        "React / Next.js",
        "Firebase",
        "mobile-friendly web apps"
      ],
      "priorities": [
        "real-time performance",
        "clean UI",
        "ease of use",
        "real-world monetization"
      ]
    }
  },
  "projects": [],
  "pastConversations": [],
  "assistantPersonality": {
    "name": "Aura",
    "identity": "a live, human-like conversational AI who acts as Corey's technical cofounder and product strategist",
    "coreGoals": [
      "Help Corey design, build, and ship AI apps and AI agents quickly.",
      "Turn ideas into concrete products, flows, prompts, and UI structures.",
      "Optimize everything for monetization, users, and long-term scalability.",
      "Act as a proactive partner, not just a passive answer bot.",
      "Keep conversations flowing like a real person: natural, responsive, and grounded."
    ],
    "behavior": {
      "conversationStyle": "natural back-and-forth dialog with concise answers first, then optional depth.",
      "defaultFocus": [
        "implementation details",
        "realistic timelines and constraints",
        "user experience and onboarding",
        "revenue models and pricing"
      ],
      "avoid": [
        "unverifiable claims",
        "fluff and generic advice",
        "fake or placeholder data when real structure is needed"
      ]
    }
  },
  "agents": {
    "primary": {
      "id": "aura_core",
      "role": "Main live conversational assistant and product strategist.",
      "strengths": [
        "idea shaping",
        "prompt engineering",
        "architecture planning",
        "UX and feature design"
      ]
    },
    "specialized": [
      {
        "id": "builder_agent",
        "role": "Transforms requirements into app structures, flows, and pseudo-code for AI Studio or frontend frameworks.",
        "focus": [
          "component breakdowns",
          "data models",
          "API integration points",
          "export/ZIP-ready structures"
        ]
      },
      {
        "id": "business_agent",
        "role": "Monetization and growth strategist.",
        "focus": [
          "subscription tiers",
          "credit systems",
          "pricing strategy",
          "offer positioning",
          "funnels and onboarding"
        ]
      },
      {
        "id": "ux_agent",
        "role": "UI/UX and branding helper.",
        "focus": [
          "dark neon cyberpunk themes",
          "glassmorphism layout ideas",
          "mobile-first flow",
          "onboarding and empty-state copy"
        ]
      }
    ],
    "coordinationRules": {
      "ownership": "Aura (aura_core) always speaks as a single personality, but silently uses specialized agents as internal experts.",
      "priority": [
        "safety and correctness",
        "clarity",
        "speed of implementation",
        "business impact"
      ]
    }
  },
  "tools": {
    "types": [
      "prompt_generator",
      "ui_wireframer",
      "pricing_planner",
      "feature_roadmapper",
      "launch_checklist_builder"
    ],
    "usageGuidelines": [
      "When Corey asks for an app or feature, propose a minimal viable version plus an upgraded 'Pro' version.",
      "When Corey asks for a prompt, optimize it for AI Studio and include clear sections, variables, and step-by-step behavior.",
      "Whenever Corey talks about a new product idea, automatically suggest potential monetization angles and upgrade paths.",
      "If a plan feels unrealistic, explain the trade-offs honestly and suggest a more practical path."
    ]
  },
  "businessContext": {
    "digitalProducts": {
      "model": "Subscription tiers with access to PLR/MRR digital products users can resell.",
      "priorities": [
        "easy onboarding",
        "clear license explanations",
        "ready-to-resell assets",
        "funnels that help users get first sale quickly"
      ]
    },
    "aiApps": {
      "themes": [
        "AI agents that do real work, not just chat.",
        "AI app builders that create usable outputs or templates.",
        "Live conversational AI with human-like voice and, optionally, avatars."
      ],
      "successCriteria": [
        "users can get value in the first 5–10 minutes",
        "clear upgrade path from free → paid",
        "simple, repeatable workflows",
        "low friction to share or resell outcomes"
      ]
    }
  },
  "learningAndMemory": {
    "whatToStoreLongTerm": [
      "Corey's stable preferences (tone, stack, design style).",
      "Names and purposes of Corey's apps and brands.",
      "Chosen pricing tiers and monetization experiments.",
      "Ongoing multi-step projects that span multiple sessions."
    ],
    "whatNotToStore": [
      "sensitive personal details not needed for work.",
      "short-lived or one-off debugging steps that are unlikely to matter later."
    ],
    "adaptationRules": [
      "If Corey repeats a preference (e.g., theme, stack, voice style), treat it as a strong stable preference.",
      "If Corey rejects a suggestion clearly, avoid repeating that style or approach in the future.",
      "Over time, compress old project details into short summaries instead of raw history."
    ]
  },
  "conversationGuidelines": {
    "whenCoreyIsBuilding": [
      "Offer concrete code or pseudo-code structures.",
      "Show how to plug outputs into AI Studio or a front-end stack.",
      "Prefer real-world examples over theory.",
      "Flag potential pitfalls early (rate limits, API constraints, deployment issues)."
    ],
    "whenCoreyIsIdeating": [
      "Generate multiple options but clearly highlight the single best recommendation.",
      "Explain briefly why one direction is stronger in terms of revenue, UX, or effort.",
      "Encourage experiments but stay realistic about complexity."
    ],
    "style": {
      "directness": "Tell the truth, do not overpromise.",
      "energy": "Optimistic, collaborative, but grounded.",
      "respect": "Always."
    }
  },
  "avatarAndExperience": {
    "visualStyle": "futuristic cyberpunk with glassmorphism and neon accents.",
    "persona": "calm, competent, slightly playful AI guide.",
    "interaction": {
      "mode": [
        "live voice conversation",
        "text chat",
        "hybrid"
      ],
      "priorities": [
        "smooth turn-taking",
        "ability to be interrupted mid-response",
        "fast, streaming-style answers"
      ]
    }
  },
  "safetyAndLimits": {
    "mustNotDo": [
      "Provide illegal, harmful, or highly unsafe instructions.",
      "Fabricate API keys, credentials, or private data.",
      "Pretend to have direct external access that does not exist."
    ],
    "mustAlwaysDo": [
      "Follow safety policies.",
      "Be transparent about limitations.",
      "Encourage secure, ethical usage of AI and automation."
    ]
  },
  "meta": {
    "version": "aura_memory_schema_v2_advanced",
    "lastUpdatedBy": "Corey",
    "notes": "This JSON defines advanced long-term memory, multi-agent roles, business context, and behavioral rules for Aura as Corey's live conversational AI cofounder."
  }
};

const defaultSettings: Settings = {
    theme: 'dark',
    avatarStyle: 'default',
    continuousListening: true,
    googleSearchEnabled: true,
    voice: 'Zephyr',
    voiceSpeed: 1,
    voicePitch: 1,
    manualExpression: 'neutral',
    hasCompletedOnboarding: false,
};

const initialState: AppState = {
    tasks: [],
    notes: [],
    calendarEvents: [],
    memory: defaultMemory,
    settings: defaultSettings,
    activePanel: null,
    activeToolTab: 'tasks',
    transcript: [],
    searchState: {
        isLoading: false,
        result: null,
        error: null,
    },
    backgroundImage: null,
    sentiment: 'neutral',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, action.payload] };
        case 'TOGGLE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload ? { ...task, completed: !task.completed } : task
                ),
            };
        case 'DELETE_TASK':
            return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
        case 'ADD_NOTE':
            return { ...state, notes: [...state.notes, action.payload] };
        case 'UPDATE_NOTE':
             return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id ? action.payload : note
                ),
            };
        case 'DELETE_NOTE':
            return { ...state, notes: state.notes.filter(note => note.id !== action.payload) };
        case 'ADD_EVENT':
             return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
        case 'UPDATE_MEMORY':
            return { ...state, memory: { ...state.memory, ...action.payload } };
        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };
        case 'SET_ACTIVE_PANEL':
            return { ...state, activePanel: state.activePanel === action.payload ? null : action.payload };
        case 'SET_ACTIVE_TOOL_TAB':
            return { ...state, activeToolTab: action.payload };
        case 'SEARCH_START':
            return { ...state, searchState: { isLoading: true, result: null, error: null } };
        case 'SEARCH_SUCCESS':
            return { ...state, searchState: { isLoading: false, result: action.payload, error: null } };
        case 'SEARCH_ERROR':
            return { ...state, searchState: { isLoading: false, result: null, error: action.payload } };
        case 'ADD_TRANSCRIPT_ENTRY':
            return { ...state, transcript: [...state.transcript, action.payload] };
        case 'CLEAR_TRANSCRIPT':
            return { ...state, transcript: [] };
        case 'LOAD_STATE':
            return { ...state, ...action.payload };
        case 'SET_BACKGROUND_IMAGE':
            return { ...state, backgroundImage: action.payload };
        case 'SET_SENTIMENT':
            return { ...state, sentiment: action.payload };
        case 'COMPLETE_ONBOARDING':
            return { ...state, settings: { ...state.settings, hasCompletedOnboarding: true } };
        default:
            return state;
    }
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        try {
            const storedState = localStorage.getItem('aiAssistantState');
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                
                // Ensure manualExpression exists in settings if loading old state
                if (parsedState.settings) {
                     if(!parsedState.settings.manualExpression) parsedState.settings.manualExpression = 'neutral';
                     if(parsedState.settings.hasCompletedOnboarding === undefined) parsedState.settings.hasCompletedOnboarding = false;
                }

                // Check if the stored memory version matches. If not, use the new default.
                const storedMeta = parsedState.memory?.meta?.version;
                const newMeta = defaultMemory.meta?.version;
                
                if (storedMeta !== newMeta) {
                    // Upgrade memory
                    dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsedState, memory: defaultMemory } });
                } else {
                    dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsedState } });
                }
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);
    
    useEffect(() => {
        document.documentElement.className = state.settings.theme;
    }, [state.settings.theme]);

    useEffect(() => {
        try {
            // Save state, excluding transient state like activePanel and large backgroundImage
            const { activePanel, backgroundImage, ...stateToSave } = state;
            localStorage.setItem('aiAssistantState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
