
import React, { useState } from 'react';
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
        className="bg-tertiary border border-border-color rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent w-full mt-2"
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

    const expressions: AvatarExpression[] = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking'];
    
    // Determine current selection for dropdown (either default or custom)
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
                                // If switching to custom but no URL yet, keep current or clear it? 
                                // Best to keep current until user types something, but we need to update the dropdown UI
                                // Effectively we treat 'custom' logic by checking if URL matches known presets
                                // For now, if they select custom, we just let them edit the text box below.
                                // If they select Default, we overwrite the setting.
                                handleSettingChange('avatarStyle', '');
                            }
                        }}
                    >
                        {avatarOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Select>
                </div>
            </SettingRow>
            
            {/* Show input if Custom is selected or if the current URL isn't one of the presets */}
            {(currentAvatarSelection === 'custom') && (
                <div className="pb-3 border-b border-border-color">
                    <label className="text-xs text-text-secondary block mb-1">Custom Ready Player Me GLB URL (must support ARKit)</label>
                    <Input 
                        value={state.settings.avatarStyle}
                        onChange={(e) => handleSettingChange('avatarStyle', e.target.value)}
                        placeholder="https://models.readyplayer.me/..."
                    />
                </div>
            )}

            <SettingRow label="Dynamic Background">
                 <button
                    onClick={handleGenerateBackground}
                    disabled={generatingBg}
                    className="bg-accent text-primary-dark font-bold py-1 px-3 rounded-md text-sm transition-all hover:bg-accent-hover disabled:opacity-50"
                >
                    {generatingBg ? 'Generating...' : 'Generate from Mood'}
                </button>
            </SettingRow>

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
                    <optgroup label="Standard Voices">
                        <option value="Puck">Puck (Male)</option>
                        <option value="Kore">Kore (Female)</option>
                    </optgroup>
                    <optgroup label="Premium Voices">
                        <option value="Zephyr">Zephyr (Female) ✨</option>
                        <option value="Charon">Charon (Male) ✨</option>
                        <option value="Fenrir">Fenrir (Male) ✨</option>
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
