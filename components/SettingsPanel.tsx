
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, AvatarExpression } from '../types';
import { useAgentRouter } from '../hooks/useAgentRouter';

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-3 border-b border-border-color">
        <label className="text-text-secondary">{label}</label>
        <div>{children}</div>
    </div>
);

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ value, onChange, children }) => (
    <select
        value={value}
        onChange={onChange}
        className="bg-tertiary border border-border-color rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent w-48 text-ellipsis"
    >
        {children}
    </select>
);

const Input: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-tertiary border border-border-color rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent w-full mt-2 text-sm"
    />
);

export const SettingsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { generateMoodBackground } = useAgentRouter();
    const [generatingBg, setGeneratingBg] = useState(false);
    
    // Default avatar used in the app
    const AURA_DEFAULT = "https://models.readyplayer.me/69189159786317131c5bb99a.glb?morphTargets=ARKit,Oculus%20Visemes";

    const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    };

    const handleGenerateBackground = async () => {
        setGeneratingBg(true);
        await generateMoodBackground();
        setGeneratingBg(false);
    };
    
    const handleResetBackground = () => {
         dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: null });
         // Optionally reset style to cinematic if preferred, but leaving as is allows quick re-gen
    };

    // Handle clearing background if "None" is selected
    useEffect(() => {
        if (state.settings.backgroundStyle === 'none') {
            dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: null });
        }
    }, [state.settings.backgroundStyle, dispatch]);
    
    const themeOptions = [
        { value: 'dark', label: 'Dark (Default)' },
        { value: 'light', label: 'Light' },
        { value: 'cyberpunk', label: 'Cyberpunk Neon' },
        { value: 'holographic', label: 'Holographic Blue' },
        { value: 'quantum', label: 'Quantum (Animated)' },
        { value: 'midnight-glass', label: 'Midnight Glass (Premium)' },
        { value: 'crimson-ops', label: 'Crimson Ops (Red/Black)' },
        { value: 'neon-royal', label: 'Neon Royal (Blue/Red)' },
    ];
    
    const avatarOptions = [
        { value: AURA_DEFAULT, label: 'Aura (Default)' },
        { value: 'custom', label: 'Custom URL (ReadyPlayerMe)' }
    ];

    const bgStyles = [
        { value: 'cinematic', label: 'Cinematic (Default)' },
        { value: 'abstract', label: 'Abstract' },
        { value: 'photorealistic', label: 'Photorealistic' },
        { value: 'cartoon', label: 'Cartoon/Stylized' },
        { value: 'cyberpunk', label: 'Cyberpunk City' },
        { value: 'neon-city', label: 'Neon City' },
        { value: 'deep-space', label: 'Deep Space' },
        { value: 'zen-garden', label: 'Zen Garden' },
        { value: 'none', label: 'None (Solid Color)' },
    ];

    const expressions: AvatarExpression[] = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking'];
    
    const currentAvatarSelection = state.settings.avatarStyle === AURA_DEFAULT ? AURA_DEFAULT : 'custom';

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">Appearance</h3>
            <SettingRow label="Theme">
                <Select
                    value={state.settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value as Settings['theme'])}
                >
                    {themeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
            </SettingRow>
            
            <SettingRow label="Avatar Model">
                <div className="flex flex-col items-end">
                     <Select
                        value={currentAvatarSelection}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                                handleSettingChange('avatarStyle', val);
                            } else {
                                handleSettingChange('avatarStyle', '');
                            }
                        }}
                    >
                        {avatarOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Select>
                </div>
            </SettingRow>
            
            {(currentAvatarSelection === 'custom') && (
                <div className="pb-3 border-b border-border-color">
                    <label className="text-xs text-text-secondary block mb-1">Custom Ready Player Me GLB URL</label>
                    <Input 
                        value={state.settings.avatarStyle}
                        onChange={(e) => handleSettingChange('avatarStyle', e.target.value)}
                        placeholder="https://models.readyplayer.me/..."
                    />
                </div>
            )}

            <div className="border-t border-border-color pt-4 mt-2">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-text-secondary">Dynamic Background</label>
                    <div className="flex gap-2">
                        {state.settings.backgroundStyle !== 'none' && (
                             <button
                                onClick={handleResetBackground}
                                className="bg-secondary border border-border-color text-text-secondary hover:text-white py-1 px-2 rounded-md text-xs transition-colors"
                                title="Reset to standard background"
                            >
                                Reset
                            </button>
                        )}
                        {state.settings.backgroundStyle !== 'none' && (
                            <button
                                onClick={handleGenerateBackground}
                                disabled={generatingBg}
                                className="bg-accent text-primary-dark font-bold py-1 px-3 rounded-md text-sm transition-all hover:bg-accent-hover disabled:opacity-50"
                            >
                                {generatingBg ? '...' : 'Generate'}
                            </button>
                        )}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mb-2">
                     <div>
                        <label className="text-xs text-text-secondary block mb-1">Style</label>
                        <Select
                            value={state.settings.backgroundStyle}
                            onChange={(e) => handleSettingChange('backgroundStyle', e.target.value as any)}
                        >
                            {bgStyles.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                     </div>
                 </div>
                 {state.settings.backgroundStyle !== 'none' && (
                     <div>
                        <label className="text-xs text-text-secondary block mb-1">Custom Keywords (Optional)</label>
                        <Input 
                            value={state.settings.backgroundKeywords}
                            onChange={(e) => handleSettingChange('backgroundKeywords', e.target.value)}
                            placeholder="e.g., neon forest, calm beach, mars base..."
                        />
                     </div>
                 )}
            </div>


            <h3 className="text-lg font-semibold text-accent mt-6">Avatar Expressions (Test)</h3>
            <div className="grid grid-cols-3 gap-2">
                {expressions.map(expr => (
                    <button
                        key={expr}
                        onClick={() => handleSettingChange('manualExpression', expr)}
                        className={`py-2 px-1 text-sm rounded-md transition-colors border border-border-color
                            ${state.settings.manualExpression === expr 
                                ? 'bg-accent text-primary-dark font-bold border-accent' 
                                : 'bg-tertiary text-text-secondary hover:text-text-primary'
                            }
                        `}
                    >
                        {expr.charAt(0).toUpperCase() + expr.slice(1)}
                    </button>
                ))}
            </div>


            <h3 className="text-lg font-semibold text-accent mt-6">Voice</h3>
            <SettingRow label="Assistant Voice">
                 <Select
                    value={state.settings.voice}
                    onChange={(e) => handleSettingChange('voice', e.target.value)}
                >
                    <optgroup label="Professional & Deep">
                        <option value="Aoede">Aoede (Confident, Female) ✨</option>
                        <option value="Charon">Charon (Deep, Male) ✨</option>
                        <option value="Fenrir">Fenrir (Resonant, Male) ✨</option>
                    </optgroup>
                    <optgroup label="Bright & Energetic">
                        <option value="Zephyr">Zephyr (Bright, Female) ✨</option>
                        <option value="Puck">Puck (Playful, Male)</option>
                        <option value="Kore">Kore (Balanced, Female)</option>
                    </optgroup>
                 </Select>
            </SettingRow>

            <h3 className="text-lg font-semibold text-accent mt-6">Behavior</h3>
             <SettingRow label="Continuous Listening">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={state.settings.continuousListening}
                        onChange={(e) => handleSettingChange('continuousListening', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-tertiary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
            </SettingRow>
            
            <SettingRow label="Enable Google Search">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={state.settings.googleSearchEnabled}
                        onChange={(e) => handleSettingChange('googleSearchEnabled', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-tertiary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
            </SettingRow>
        </div>
    );
};
