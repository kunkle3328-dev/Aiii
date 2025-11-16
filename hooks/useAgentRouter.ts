

// FIX: Imported 'useRef' to resolve 'Cannot find name' error.
import { useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../context/AppContext';
import { Task, Note, CalendarEvent } from '../types';

export const useAgentRouter = () => {
    const { state, dispatch } = useAppContext();
    const aiRef = useRef<GoogleGenAI | null>(null);

    const routeIntent = useCallback(async (userInput: string) => {
        if (!process.env.API_KEY) {
            console.error("API key not found for agent router.");
            return;
        }

        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }

        const systemInstruction = `You are the routing agent for a conversational AI. Your job is to analyze the user's input and determine which tool to use.
Respond ONLY with a JSON object matching the response schema. Do not add any commentary or markdown formatting.

Current context:
- User Memory: ${JSON.stringify(state.memory)}
- Existing Tasks: ${JSON.stringify(state.tasks)}

User Input: "${userInput}"

Determine the correct agent and action.
- For tasks, use "tasks" agent. Actions: "add", "list", "complete", "delete".
- For notes, use "notes" agent. Actions: "add", "list", "update".
- For calendar, use "calendar" agent. Actions: "add", "list".
- For memory updates, use "memory" agent. Action: "update".
- For general conversation, use "conversation" agent. Action: "chat".
- For search queries, use "search" agent. Action: "query".

If adding a task, note or event, generate a suitable title and content.
If adding a calendar event, infer start and end times. Assume duration is 1 hour if not specified.
If updating memory, specify the key and new value.
`;

        try {
            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: systemInstruction,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            agent: { type: Type.STRING },
                            action: { type: Type.STRING },
                            payload: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING, description: "ID of item to modify" },
                                    text: { type: Type.STRING, description: "Content for task or note" },
                                    title: { type: Type.STRING, description: "Title for note or event" },
                                    start: { type: Type.STRING, description: "ISO date string for event start" },
                                    end: { type: Type.STRING, description: "ISO date string for event end" },
                                    key: { type: Type.STRING, description: "Key for memory update" },
                                    value: { type: Type.STRING, description: "Value for memory update" },
                                },
                            },
                        },
                    },
                },
            });

            const resultText = response.text.trim();
            const routedAction = JSON.parse(resultText);

            console.log("Agent Router Decision:", routedAction);

            const { agent, action, payload } = routedAction;

            switch (agent) {
                case 'tasks':
                    if (action === 'add' && payload.text) {
                        const newTask: Task = { id: crypto.randomUUID(), text: payload.text, completed: false, createdAt: new Date().toISOString() };
                        dispatch({ type: 'ADD_TASK', payload: newTask });
                    } else if (action === 'complete' && payload.id) {
                         dispatch({ type: 'TOGGLE_TASK', payload: payload.id });
                    }
                    break;
                case 'notes':
                     if (action === 'add' && payload.title && payload.text) {
                        const newNote: Note = { id: crypto.randomUUID(), title: payload.title, content: payload.text, tags: [], createdAt: new Date().toISOString() };
                        dispatch({ type: 'ADD_NOTE', payload: newNote });
                    }
                    break;
                case 'calendar':
                    if (action === 'add' && payload.title && payload.start && payload.end) {
                        const newEvent: CalendarEvent = { id: crypto.randomUUID(), title: payload.title, start: payload.start, end: payload.end };
                        dispatch({ type: 'ADD_EVENT', payload: newEvent });
                    }
                    break;
                case 'memory':
                    if (action === 'update' && payload.key && payload.value) {
                       // Simple implementation, a more robust one would handle nested keys
                       dispatch({type: 'UPDATE_MEMORY', payload: {[payload.key]: payload.value}})
                    }
                    break;
                case 'conversation':
                    // Handled by the live agent
                    break;
                case 'search':
                     // Placeholder for search tool integration
                    console.log("Search query:", payload.text);
                    break;
            }

        } catch (error) {
            console.error("Error in agent router:", error);
        }

    }, [state.memory, state.tasks, dispatch]);

    return { routeIntent };
};