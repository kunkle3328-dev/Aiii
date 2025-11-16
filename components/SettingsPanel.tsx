
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings } from '../types';

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-800">
        <label className="text-gray-300">{label}</label>
        <div>{children}</div>
    </div>
);

const Select: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={onChange}
        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
    >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

export const SettingsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();

    const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    };
    
    const themeOptions = [
        { value: 'dark', label: 'Dark' },
        { value: 'light', label: 'Light' },
        { value: 'cyberpunk', label: 'Cyberpunk' },
        { value: 'holographic', label: 'Holographic' },
    ];

    const voiceOptions = [
        { value: 'Zephyr', label: 'Zephyr (Female)' },
        { value: 'Puck', label: 'Puck (Male)' },
        { value: 'Charon', label: 'Charon (Male)' },
        { value: 'Kore', label: 'Kore (Female)' },
        { value: 'Fenrir', label: 'Fenrir (Male)' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent-cyan">Appearance</h3>
            <SettingRow label="Theme">
                <Select
                    value={state.settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value as Settings['theme'])}
                    options={themeOptions}
                />
            </SettingRow>

            <h3 className="text-lg font-semibold text-accent-cyan mt-6">Voice</h3>
            <SettingRow label="Assistant Voice">
                 <Select
                    value={state.settings.voice}
                    onChange={(e) => handleSettingChange('voice', e.target.value)}
                    options={voiceOptions}
                />
            </SettingRow>

            {/* <SettingRow label="Voice Speed">
                <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={state.settings.voiceSpeed}
                    onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                    className="w-32"
                />
                <span>{state.settings.voiceSpeed.toFixed(1)}x</span>
            </SettingRow>
            
            <SettingRow label="Voice Pitch">
                 <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={state.settings.voicePitch}
                    onChange={(e) => handleSettingChange('voicePitch', parseFloat(e.target.value))}
                    className="w-32"
                />
                <span>{state.settings.voicePitch.toFixed(1)}x</span>
            </SettingRow> */}

            <h3 className="text-lg font-semibold text-accent-cyan mt-6">Behavior</h3>
             <SettingRow label="Continuous Listening">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={state.settings.continuousListening}
                        onChange={(e) => handleSettingChange('continuousListening', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-cyan peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                </label>
            </SettingRow>
        </div>
    );
};
