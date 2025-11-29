
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

    // Helper to fetch and convert Pollinations image to Base64
    const fetchPollinationsFallback = async (prompt: string, aspectRatio: string): Promise<string | null> => {
        try {
            const width = aspectRatio === '16:9' ? 1280 : 720;
            const height = aspectRatio === '16:9' ? 720 : 1280;
            const seed = Math.floor(Math.random() * 10000);
            const safePrompt = encodeURIComponent(prompt.substring(0, 1000)); // Limit length
            
            // Pollinations.ai URL (No API Key required)
            const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error("Pollinations fetch failed");
            
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Pollinations fallback failed:", e);
            return null;
        }
    };

    // Helper to generate a simple hash for caching
    const generateHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    };

    const generateMoodBackground = useCallback(async () => {
        // 0. Check if style is none, if so, do nothing or clear
        if (state.settings.backgroundStyle === 'none') {
            dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: null });
            return;
        }

        const ai = getAiClient();
        if (!ai) return;

        dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "🎨 Generating new background...", timestamp: Date.now() } });

        const recentTranscript = state.transcript.slice(-10).map(t => `${t.speaker}: ${t.text}`).join('\n');
        
        // 1. Analyze context for keywords (Lightweight text call, usually cheap/fast)
        let finalKeywords = state.settings.backgroundKeywords || "";
        try {
            if (!finalKeywords && recentTranscript) {
                // If manual keywords are empty, ask AI to extract them
                const analysisPrompt = `Extract 3 visual keywords from this conversation for a wallpaper. CSV format only. Context: ${recentTranscript}`;
                const analysisResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: analysisPrompt,
                });
                finalKeywords = analysisResponse.text.trim();
            }
        } catch (e) {
            console.warn("Keyword extraction failed, using defaults");
            finalKeywords = "futuristic, abstract, neon";
        }

        const isLandscape = window.innerWidth > window.innerHeight;
        const aspectRatio = isLandscape ? "16:9" : "9:16";
        const userStyle = state.settings.backgroundStyle || 'cinematic';
        
        // Enhance prompt based on style
        let stylePrompt = "";
        switch (userStyle) {
            case 'cinematic': stylePrompt = "cinematic shot, dramatic lighting, shallow depth of field, 8k, movie scene"; break;
            case 'abstract': stylePrompt = "abstract digital art, geometric shapes, fluid gradients, modern, minimalist"; break;
            case 'photorealistic': stylePrompt = "photorealistic, 8k, highly detailed, natural lighting, photography"; break;
            case 'cartoon': stylePrompt = "stylized 3d render, toon shader, vibrant colors, soft lighting, pixar style"; break;
            case 'cyberpunk': stylePrompt = "cyberpunk city, neon lights, night time, rain, high tech, futuristic"; break;
            case 'neon-city': stylePrompt = "synthwave, retrowave, neon violet and blue, cityscape, glowing"; break;
            case 'deep-space': stylePrompt = "deep space, nebula, stars, galaxies, cosmic, ethereal, vibrant"; break;
            case 'zen-garden': stylePrompt = "peaceful zen garden, nature, rocks, sand, bonsai, soft sunlight, calming"; break;
            default: stylePrompt = "high quality wallpaper";
        }

        const imagePrompt = `${stylePrompt} of ${finalKeywords}. No text, no words, background image.`;

        // 2. Check Cache
        const cacheKey = `bg_cache_${generateHash(imagePrompt + aspectRatio)}`;
        const cachedImage = localStorage.getItem(cacheKey);
        
        if (cachedImage) {
             dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: cachedImage });
             dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "✨ Background updated (Cached).", timestamp: Date.now() } });
             return;
        }

        try {
            // 3. Try Gemini Image Gen first
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] },
                config: {
                    imageConfig: { aspectRatio: aspectRatio }
                }
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
                
                // Save to cache (limit cache size by removing random item if too large logic omitted for brevity, relying on browser quota)
                try {
                    localStorage.setItem(cacheKey, imageUrl);
                } catch(e) {
                    // Storage full, clear old cache items
                    console.warn("Storage full, clearing background cache");
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('bg_cache_')) localStorage.removeItem(key);
                    });
                    try { localStorage.setItem(cacheKey, imageUrl); } catch(e) {}
                }

                dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: imageUrl });
                dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "✨ Background updated (Gemini).", timestamp: Date.now() } });
                return; // Success!
            }

        } catch (error: any) {
            // 4. Fallback to Pollinations.ai if Gemini fails
            console.warn("Gemini Image Gen failed, attempting fallback...", error.message);
            
            dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "⚠️ Gemini quota hit. Switching to backup generator...", timestamp: Date.now() } });
            
            const fallbackImage = await fetchPollinationsFallback(imagePrompt, aspectRatio);
            
            if (fallbackImage) {
                dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: fallbackImage });
                dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "✨ Background updated (Backup System).", timestamp: Date.now() } });
            } else {
                 dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', payload: { id: crypto.randomUUID(), speaker: 'system', text: "❌ Background generation failed.", timestamp: Date.now() } });
            }
        }
    }, [state.transcript, state.settings.backgroundStyle, state.settings.backgroundKeywords, dispatch]);

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
                            text: "⚠️ System Alert: API Quota exceeded for routing. Some agent features may be paused.",
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
