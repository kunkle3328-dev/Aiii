import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ConnectionState } from '../types';

// IMPORTANT: This is a publicly available Ready Player Me avatar. 
// Replace with your own GLB model URL that has ARKit compatible blendshapes.
const AVATAR_URL = "https://models.readyplayer.me/69189159786317131c5bb99a.glb";

interface AvatarProps {
    modelAmplitude: number;
    userSpeaking: boolean;
    connectionState: ConnectionState;
}

export const Avatar: React.FC<AvatarProps> = ({ modelAmplitude, userSpeaking, connectionState }) => {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(AVATAR_URL);
    const { actions } = useAnimations(animations, group);

    const headRef = useRef<THREE.Object3D | null>(null);
    const eyeLRef = useRef<THREE.Object3D | null>(null);
    const eyeRRef = useRef<THREE.Object3D | null>(null);

    useEffect(() => {
        // Find the head and eyes once the scene is loaded
        scene.traverse((object) => {
            if (object.name === 'Head') headRef.current = object;
            if (object.name === 'LeftEye') eyeLRef.current = object;
            if (object.name === 'RightEye') eyeRRef.current = object;
        });

        // Play a subtle idle animation
        const idleAnimation = actions['idle'];
        if (idleAnimation) {
            idleAnimation.play();
        }
    }, [scene, actions]);

    useFrame((state, delta) => {
        if (!group.current) return;
        
        // --- Lip Sync ---
        // Map model's speech amplitude to mouth opening blendshape
        const mouthOpen = group.current.getObjectByName('Wolf3D_Head') as THREE.SkinnedMesh;
        const mouthOpenIndex = mouthOpen?.morphTargetDictionary?.['mouthOpen'];
        if (mouthOpen && mouthOpenIndex !== undefined && mouthOpen.morphTargetInfluences) {
             const targetInfluence = Math.min(modelAmplitude * 3.0, 1.0); // Amplify for visible effect
             mouthOpen.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(
                mouthOpen.morphTargetInfluences[mouthOpenIndex],
                targetInfluence,
                0.5 // Smoothing factor
            );
        }

        // --- Head & Eye Tracking ---
        // Make the avatar look towards the camera/user
        const { camera } = state;
        if (headRef.current) {
            headRef.current.lookAt(camera.position);
        }
        
        // Subtle idle head movement
        const time = state.clock.getElapsedTime();
        if (headRef.current) {
            headRef.current.rotation.y += Math.sin(time * 0.5) * 0.0005;
            headRef.current.rotation.x += Math.cos(time * 0.5) * 0.0005;
        }

        // --- Emotional/State-based expressions ---
        const browDownLIndex = mouthOpen?.morphTargetDictionary?.['browDownLeft'];
        const browDownRIndex = mouthOpen?.morphTargetDictionary?.['browDownRight'];
        
        if (mouthOpen.morphTargetInfluences && browDownLIndex !== undefined && browDownRIndex !== undefined) {
            // When user is speaking, avatar looks more attentive (slight brow furrow)
            const browTarget = userSpeaking ? 0.3 : 0;
            mouthOpen.morphTargetInfluences[browDownLIndex] = THREE.MathUtils.lerp(mouthOpen.morphTargetInfluences[browDownLIndex], browTarget, 0.1);
            mouthOpen.morphTargetInfluences[browDownRIndex] = THREE.MathUtils.lerp(mouthOpen.morphTargetInfluences[browDownRIndex], browTarget, 0.1);
        }

         // Blinking
        const eyeBlinkLIndex = mouthOpen?.morphTargetDictionary?.['eyeBlinkLeft'];
        const eyeBlinkRIndex = mouthOpen?.morphTargetDictionary?.['eyeBlinkRight'];
        if (mouthOpen.morphTargetInfluences && eyeBlinkLIndex !== undefined && eyeBlinkRIndex !== undefined) {
            const blink = Math.max(0, -Math.cos(time * 0.5) - 0.5) * 2;
            mouthOpen.morphTargetInfluences[eyeBlinkLIndex] = blink;
            mouthOpen.morphTargetInfluences[eyeBlinkRIndex] = blink;
        }
    });

    return <primitive ref={group} object={scene} scale={1.2} position={[0, -1.6, 0]} />;
};

useGLTF.preload(AVATAR_URL);