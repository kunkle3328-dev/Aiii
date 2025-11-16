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

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
    modelAmplitude,
    userSpeaking,
    connectionState,
}) => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{
                    position: [0, 0.9, 1.7],   // pulled back + higher
                    fov: 35,                   // wider, more natural framing
                }}
            >
                {/* Lights */}
                <ambientLight intensity={1.1} />
                <directionalLight position={[2, 5, 2]} intensity={1.6} />
                <pointLight position={[0, 1, 1.2]} intensity={1.3} />

                <Suspense fallback={null}>
                    {/* 
                        Shift the avatar UP so it sits in the upper half 
                        directly under the title text 
                    */}
                    <group position={[0, 0.55, 0]}>
                        <Avatar
                            modelAmplitude={modelAmplitude}
                            userSpeaking={userSpeaking}
                            connectionState={connectionState}
                        />
                    </group>

                    <Environment preset="studio" />
                </Suspense>
            </Canvas>
        </div>
    );
};