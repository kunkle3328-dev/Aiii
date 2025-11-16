
import React, { useRef, useEffect } from 'react';
import { TranscriptEntry } from '../types';

interface TranscriptProps {
    transcript: TranscriptEntry[];
}

export const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="w-full max-w-4xl mx-auto h-full overflow-y-auto space-y-4 pr-4 custom-scrollbar">
            {transcript.map((entry) => (
                <div key={entry.id} className={`flex flex-col ${entry.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="px-3 pb-1 text-sm text-gray-400">
                        {entry.speaker === 'model' ? 'Aura' : 'User'}
                    </span>
                    <div className={`max-w-md md:max-w-lg p-3 rounded-2xl text-base ${entry.speaker === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-secondary-dark rounded-bl-none'}`}>
                        <p>{entry.text}</p>
                    </div>
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};
