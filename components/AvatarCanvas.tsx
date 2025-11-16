
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Avatar } from './Avatar';
import { ConnectionState } from '../types';

interface AvatarCanvasProps {
    modelAmplitude: number;
    userSpeaking: boolean;
    connectionState: ConnectionState;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ modelAmplitude, userSpeaking, connectionState }) => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0.2, 1.0], fov: 30 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[2, 5, 2]} intensity={1.5} />
                <pointLight position={[0, 0.5, 1]} intensity={1.5} />
                <Suspense fallback={null}>
                    <Avatar 
                        modelAmplitude={modelAmplitude}
                        userSpeaking={userSpeaking}
                        connectionState={connectionState}
                    />
                    <Environment preset="studio" />
                </Suspense>
            </Canvas>
        </div>
    );
};