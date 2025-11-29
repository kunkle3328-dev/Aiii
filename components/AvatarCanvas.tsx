
import React, { Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from './Avatar';
import { ConnectionState } from '../types';
import { useAppContext } from '../context/AppContext';

interface AvatarCanvasProps {
    modelAmplitude: number;
    userSpeaking: boolean;
    connectionState: ConnectionState;
}

// Background component that locks to camera and fills the view
const Background: React.FC<{ url: string }> = ({ url }) => {
    const texture = useTexture(url);
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, viewport } = useThree();

    useFrame(() => {
        if (meshRef.current) {
            // Lock background to camera movement
            meshRef.current.position.copy(camera.position);
            meshRef.current.quaternion.copy(camera.quaternion);
            meshRef.current.translateZ(-10);
        }
    });

    // Calculate dimensions to cover the frustum at distance 10
    const distance = 10;
    // Standard PerspectiveCamera math
    const vFov = THREE.MathUtils.degToRad(camera instanceof THREE.PerspectiveCamera ? camera.fov : 30);
    const height = 2 * Math.tan(vFov / 2) * distance;
    const width = height * viewport.aspect;

    return (
        <mesh ref={meshRef} scale={[width, height, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
    );
};

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
    modelAmplitude,
    userSpeaking,
    connectionState,
}) => {
    const { state } = useAppContext();

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{
                    position: [0, 1.60, 1.2], 
                    fov: 30,
                }}
            >
                <ambientLight intensity={0.9} />
                <directionalLight position={[3, 5, 2]} intensity={1.4} />
                <pointLight position={[0, 1.3, 1.2]} intensity={1.1} />

                <Suspense fallback={null}>
                    {/* Key forces re-mount when URL changes to ensure texture update */}
                    {state.backgroundImage && <Background key={state.backgroundImage} url={state.backgroundImage} />}
                    
                    <group position={[0, -0.7, 0]}>
                        <Avatar
                            key={state.settings.avatarStyle} 
                            modelAmplitude={modelAmplitude}
                            userSpeaking={userSpeaking}
                            connectionState={connectionState}
                            manualExpression={state.settings.manualExpression}
                        />
                    </group>

                    <Environment preset="studio" />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default AvatarCanvas;
