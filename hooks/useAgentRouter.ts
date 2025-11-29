
import { useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAppContext } from '../context/AppContext';
import { Task, Note, CalendarEvent, SearchResult } from '../types';

export const useAgentRouter = () => {
    const { state, dispatch } = useAppContext();
    const aiRef = useRef<GoogleGenAI | null>(null);
    const lastErrorTimeRef = useRef<number>(0);

    const getAiClient = () => {
        if (!process.env.API_KEY) {
            console.error("API key not found.");
            return null;
        }
        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        return aiRef.current;
    }

    const generateMoodBackground = useCallback(async () => {
        const ai = getAiClient();
        if (!ai) return;

        dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "🎨 Analyzing conversation mood to generate background...", timestamp: Date.now() } });

        try {
            const recentTranscript = state.transcript.slice(-10).map(t => `${t.speaker}: ${t.text}`).join('\n');
            const analysisPrompt = `Analyze the following conversation and extract 3-5 visual keywords that represent the mood, setting, and topic.
            Transcript:
            ${recentTranscript}
            Return ONLY a comma-separated list of visual keywords (e.g., "cyberpunk city, neon rain, dark blue").`;

            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: analysisPrompt,
            });

            const keywords = analysisResponse.text.trim();
            const imagePrompt = `A high-quality, abstract, cinematic background image representing: ${keywords}. 
            Style: Photorealistic, 8k resolution, deep depth of field, ambient lighting. 
            Aspect Ratio: 1:1 (Square) - designed to be cropped/filled on screens.
            Crucial: NO text, NO watermarks, NO faces. Just scenery or abstract textures.`;

            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] }
            });

            let base64Image = null;
            if (imageResponse.candidates && imageResponse.candidates[0].content && imageResponse.candidates[0].content.parts) {
                for (const part of imageResponse.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Image = part.inlineData.data;
                        break;
                    }
                }
            }

            if (base64Image) {
                const imageUrl = `data:image/png;base64,${base64Image}`;
                dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: imageUrl });
                dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "✨ Background updated.", timestamp: Date.now() } });
            }

        } catch (error: any) {
            console.error("Background Generation Error:", error);
            
            const isRateLimit = 
                error.message?.includes('429') || 
                error.status === 'RESOURCE_EXHAUSTED' || 
                (error.error && error.error.code === 429) ||
                JSON.stringify(error).includes('RESOURCE_EXHAUSTED');

            if (isRateLimit) {
                dispatch({ 
                    type: 'ADD_TRANSCRIPT_ENTRY', 
                    payload: { 
                        id: crypto.randomUUID(), 
                        speaker: 'system', 
                        text: "⚠️ System Alert: Background generation skipped due to API Quota exceeded.", 
                        timestamp: Date.now() 
                    } 
                });
            } else {
                dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "⚠️ Failed to generate background.", timestamp: Date.now() } });
            }
        }
    }, [state.transcript, dispatch]);

    const analyzeSentiment = useCallback(async (text: string) => {
         const ai = getAiClient();
         if (!ai) return;

         try {
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: `Analyze the sentiment of this text. Return ONLY one of the following words: positive, negative, neutral, curious, confused. Text: "${text}"`
             });
             const sentiment = response.text.trim().toLowerCase();
             if (['positive', 'negative', 'neutral', 'curious', 'confused'].includes(sentiment)) {
                 dispatch({ type: 'SET_SENTIMENT', payload: sentiment as any });
             }
         } catch(e) {
             console.warn("Sentiment analysis failed", e);
         }
    }, [dispatch]);

    // AI Studio Tools
    const generateCode = useCallback(async (prompt: string) => {
        const ai = getAiClient();
        if (!ai) return "Error: No API Client";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Write code for: ${prompt}. Return ONLY the code, no markdown explanations.`
            });
            return response.text;
        } catch (e: any) { return "Error generating code: " + e.message; }
    }, []);

    const summarizeContent = useCallback(async (text: string) => {
        const ai = getAiClient();
        if (!ai) return "Error: No API Client";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Summarize this text concisely: ${text}`
            });
            return response.text;
        } catch (e: any) { return "Error summarizing: " + e.message; }
    }, []);

    const creativeWrite = useCallback(async (prompt: string) => {
        const ai = getAiClient();
        if (!ai) return "Error: No API Client";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Write a creative piece based on: ${prompt}`
            });
            return response.text;
        } catch (e: any) { return "Error writing: " + e.message; }
    }, []);


    const routeIntent = useCallback(async (userInput: string) => {
        const ai = getAiClient();
        if (!ai) return;
        
        // Trigger sentiment analysis in parallel
        analyzeSentiment(userInput);

        const isSearchEnabled = state.settings.googleSearchEnabled;

        const systemInstruction = `You are the routing agent for a conversational AI.
Respond ONLY with a JSON object matching the response schema.

User Input: "${userInput}"

Determine the correct agent and action.
- For tasks: "tasks" -> "add", "list", "complete", "delete".
- For notes: "notes" -> "add", "list", "update".
- For calendar: "calendar" -> "add", "list".
- For memory: "memory" -> "update".
- For conversation: "conversation" -> "chat".
${isSearchEnabled ? '- For search: "search" -> "query".' : ''}

Payload details:
- Task/Note/Query text goes in "text".
- Calendar events need "start" and "end" (ISO strings).
`;

        try {
            const response = await ai.models.generateContent({
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
                                    id: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    start: { type: Type.STRING },
                                    end: { type: Type.STRING },
                                    key: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                },
                            },
                        },
                    },
                },
            });

            const resultText = response.text.trim();
            const routedAction = JSON.parse(resultText);
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
                       dispatch({type: 'UPDATE_MEMORY', payload: {[payload.key]: payload.value}})
                    }
                    break;
                case 'search':
                    if (isSearchEnabled && action === 'query' && payload.text) {
                        dispatch({ type: 'SEARCH_START' });
                        try {
                            const searchResponse = await ai.models.generateContent({
                                model: "gemini-2.5-flash",
                                contents: payload.text,
                                config: {
                                    tools: [{googleSearch: {}}],
                                },
                            });
                            const text = searchResponse.text;
                            const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
                            const sources = groundingChunks
                                .map(chunk => chunk.web)
                                .filter((source): source is { uri: string, title: string } => !!source && !!source.uri);

                            const result: SearchResult = { text, sources };
                            dispatch({ type: 'SEARCH_SUCCESS', payload: result });
                            
                            const formattedSources = sources.map((s, i) => `[${i+1}] ${s.title}`).join('\n');
                            const transcriptText = `🔎 **I found this:**\n${text}\n\n**Sources:**\n${formattedSources}`;
                            
                            dispatch({
                                type: 'ADD_TRANSCRIPT_ENTRY',
                                payload: { id: crypto.randomUUID(), speaker: 'model', text: transcriptText, timestamp: Date.now() }
                            });

                        } catch(e) {
                            dispatch({ type: 'SEARCH_ERROR', payload: 'An error occurred during the search.' });
                        }
                    }
                    break;
            }

        } catch (error: any) {
             const isRateLimit = 
                error.message?.includes('429') || 
                error.status === 'RESOURCE_EXHAUSTED' || 
                (error.error && error.error.code === 429) ||
                JSON.stringify(error).includes('RESOURCE_EXHAUSTED');

            if (isRateLimit) {
                const now = Date.now();
                if (now - lastErrorTimeRef.current > 60000) {
                    dispatch({
                        type: 'ADD_TRANSCRIPT_ENTRY',
                        payload: {
                            id: crypto.randomUUID(),
                            speaker: 'system',
                            text: "⚠️ System Alert: API Quota exceeded.",
                            timestamp: now
                        }
                    });
                    lastErrorTimeRef.current = now;
                }
            } else {
                console.error("Error in agent router:", error);
            }
        }

    }, [state.memory, state.tasks, state.settings.googleSearchEnabled, dispatch, analyzeSentiment]);

    return { routeIntent, generateMoodBackground, generateCode, summarizeContent, creativeWrite };
};
