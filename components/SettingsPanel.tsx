
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
        className="bg-tertiary border border-border-color rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
    >
        {children}
    </select>
);

export const SettingsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { generateMoodBackground } = useAgentRouter();
    const [generatingBg, setGeneratingBg] = useState(false);

    const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    };

    const handleGenerateBackground = async () => {
        setGeneratingBg(true);
        await generateMoodBackground();
        setGeneratingBg(false);
    };
    
    const themeOptions = [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
        { value: 'cyberpunk', label: 'Cyberpunk' },
        { value: 'holographic', label: 'Holographic' },
    ];

    const expressions: AvatarExpression[] = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'thinking'];

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
