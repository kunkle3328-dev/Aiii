
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ConnectionState, AvatarExpression, AppState } from '../types';
import { useAppContext } from '../context/AppContext';

const AVATAR_URL =
  "https://models.readyplayer.me/69189159786317131c5bb99a.glb?morphTargets=ARKit,Oculus%20Visemes";
  
const visemeMap: { [key: string]: string } = {
  sil: "viseme_sil",
  PP: "viseme_PP",
  FF: "viseme_FF",
  TH: "viseme_TH",
  DD: "viseme_DD",
  kk: "viseme_kk",
  CH: "viseme_CH",
  SS: "viseme_SS",
  nn: "viseme_nn",
  RR: "viseme_RR",
  aa: "viseme_aa",
  E: "viseme_E",
  I: "viseme_I",
  O: "viseme_O",
  U: "viseme_U",
};

const vowels = ['viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U'];

interface AvatarProps {
  modelAmplitude: number;
  userSpeaking: boolean;
  connectionState: ConnectionState;
  manualExpression?: AvatarExpression;
}

const Avatar: React.FC<AvatarProps> = ({
  modelAmplitude,
  userSpeaking,
  connectionState,
  manualExpression = 'neutral',
}) => {
  const { state } = useAppContext();
  const sentiment = state.sentiment; // Get sentiment from global state

  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(AVATAR_URL) as any;

  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const leftEyeRef = useRef<THREE.Object3D | null>(null);
  const rightEyeRef = useRef<THREE.Object3D | null>(null);
  
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);
  const spineBoneRef = useRef<THREE.Object3D | null>(null);
  
  const smoothedAmplitude = useRef(0);
  const mouthOpenRef = useRef(0);
  const targetVisemeRef = useRef<string>('viseme_sil');
  const visemeTimerRef = useRef(0);
  const seed = useRef(Math.random() * 100);
  
  const nodTimerRef = useRef(0);
  const isNoddingRef = useRef(false);
  const nodDurationRef = useRef(0);
  const nodStartTimeRef = useRef(0);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (
        child.name.includes("Wolf3D_Body") || child.name.includes("Outfit") ||
        child.name.includes("Bottom") || child.name.includes("Top") || child.name.includes("Footwear")
      ) {
        child.visible = false;
      }
      if (child.isSkinnedMesh && (child.name.includes("Head") || child.name.includes("Wolf3D_Head"))) {
        headMeshRef.current = child;
      }
      if (child.isBone) {
          if (child.name === 'Head') headBoneRef.current = child;
          if (child.name === 'Neck') neckBoneRef.current = child;
          if (child.name === 'Spine2') spineBoneRef.current = child;
      }
      if (child.name === "EyeLeft" || child.name === "LeftEye") leftEyeRef.current = child;
      if (child.name === "EyeRight" || child.name === "RightEye") rightEyeRef.current = child;
    });
  }, [scene]);

  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();
    const t = time + seed.current;
    
    smoothedAmplitude.current = THREE.MathUtils.lerp(smoothedAmplitude.current, modelAmplitude, 0.25);
    const amp = smoothedAmplitude.current;

    if (headMeshRef.current) {
      const dict = headMeshRef.current.morphTargetDictionary;
      const infl = headMeshRef.current.morphTargetInfluences;

      if (dict && infl) {
        // Reset base
        Object.values(visemeMap).forEach(key => {
            const index = dict[key];
            if (index !== undefined) {
                infl[index] = THREE.MathUtils.lerp(infl[index], 0, 0.2); 
            }
        });

        // Calculate Expression Targets
        let browInnerUp = 0;
        let browDown = 0;
        let mouthSmile = 0;
        let mouthFrown = 0;
        let eyeSquint = 0;
        let mouthPucker = 0;
        let jawOpen = 0;

        // 1. Manual Override Priority
        if (manualExpression !== 'neutral') {
             switch (manualExpression) {
                case 'happy': mouthSmile = 0.7; browInnerUp = 0.3; eyeSquint = 0.3; break;
                case 'sad': mouthFrown = 0.6; browDown = 0.3; browInnerUp = 0.4; break;
                case 'angry': browDown = 0.8; eyeSquint = 0.4; mouthFrown = 0.3; break;
                case 'surprised': browInnerUp = 0.9; jawOpen = 0.2; break;
                case 'thinking': browDown = 0.3; eyeSquint = 0.5; mouthPucker = 0.2; break;
            }
        } else {
            // 2. Sentiment-Driven Nuance (when neutral)
            switch (sentiment) {
                case 'positive':
                    mouthSmile = 0.3;
                    browInnerUp = 0.2;
                    break;
                case 'negative':
                    mouthFrown = 0.2;
                    browDown = 0.2;
                    break;
                case 'curious':
                    browInnerUp = 0.5;
                    eyeSquint = 0.2;
                    break;
                case 'confused':
                    browDown = 0.3;
                    mouthPucker = 0.2;
                    break;
                case 'neutral':
                default:
                    // Subtle resting face
                    break;
            }

            // 3. Speaking/Listening Overrides
            if (userSpeaking) {
                browInnerUp = Math.max(browInnerUp, 0.4); 
                mouthSmile = Math.max(mouthSmile, 0.2);
            } else if (amp > 0.1) {
                browInnerUp = Math.max(browInnerUp, amp * 0.5);
                mouthSmile = Math.max(mouthSmile, 0.1 + (Math.sin(t * 5) * 0.1));
            }
        }

        // Apply morphs
        if (dict["browInnerUp"] !== undefined) infl[dict["browInnerUp"]] = THREE.MathUtils.lerp(infl[dict["browInnerUp"]], browInnerUp, 0.1);
        if (dict["browDownRight"] !== undefined) infl[dict["browDownRight"]] = THREE.MathUtils.lerp(infl[dict["browDownRight"]], browDown, 0.1);
        if (dict["browDownLeft"] !== undefined) infl[dict["browDownLeft"]] = THREE.MathUtils.lerp(infl[dict["browDownLeft"]], browDown, 0.1);
        if (dict["mouthSmile"] !== undefined) infl[dict["mouthSmile"]] = THREE.MathUtils.lerp(infl[dict["mouthSmile"]], mouthSmile, 0.1);
        if (dict["mouthFrownRight"] !== undefined) infl[dict["mouthFrownRight"]] = THREE.MathUtils.lerp(infl[dict["mouthFrownRight"]], mouthFrown, 0.1);
        if (dict["mouthFrownLeft"] !== undefined) infl[dict["mouthFrownLeft"]] = THREE.MathUtils.lerp(infl[dict["mouthFrownLeft"]], mouthFrown, 0.1);
        if (dict["eyeSquintRight"] !== undefined) infl[dict["eyeSquintRight"]] = THREE.MathUtils.lerp(infl[dict["eyeSquintRight"]], eyeSquint, 0.1);
        if (dict["eyeSquintLeft"] !== undefined) infl[dict["eyeSquintLeft"]] = THREE.MathUtils.lerp(infl[dict["eyeSquintLeft"]], eyeSquint, 0.1);
        if (dict["mouthPucker"] !== undefined) infl[dict["mouthPucker"]] = THREE.MathUtils.lerp(infl[dict["mouthPucker"]], mouthPucker, 0.1);
        
        if (manualExpression === 'surprised') {
            if (dict["jawOpen"] !== undefined) infl[dict["jawOpen"]] = THREE.MathUtils.lerp(infl[dict["jawOpen"]], jawOpen, 0.1);
        }

        // Lip Sync
        if (amp > 0.01) {
            if (time > visemeTimerRef.current) {
                const randIndex = Math.floor(Math.random() * vowels.length);
                targetVisemeRef.current = vowels[randIndex];
                visemeTimerRef.current = time + 0.1 + Math.random() * 0.1;
            }

            let rawOpen = Math.sqrt(amp) * 3.5;
            const mouthOpen = Math.min(rawOpen, 1.0);
            
            mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, mouthOpen, 0.3);
            
            const targetIndex = dict[targetVisemeRef.current];
            if (targetIndex !== undefined) {
                 infl[targetIndex] = THREE.MathUtils.lerp(infl[targetIndex], mouthOpenRef.current, 0.5);
            }
            
            if (Math.sin(t * 20) > 0.8 || amp < 0.05) {
                 const ppIndex = dict['viseme_PP'];
                 if (ppIndex !== undefined) infl[ppIndex] = THREE.MathUtils.lerp(infl[ppIndex], 0.5, 0.4);
            }

        } else {
             if (manualExpression !== 'surprised') {
                mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, 0, 0.2);
             }
        }

        // Blinking
        const blinkTrigger = Math.sin(t * 0.5) > 0.99 || Math.random() > 0.995;
        const blinkVal = blinkTrigger ? 1 : 0;
        if (dict["eyeBlinkLeft"] !== undefined) infl[dict["eyeBlinkLeft"]] = THREE.MathUtils.lerp(infl[dict["eyeBlinkLeft"]], blinkVal, 0.4);
        if (dict["eyeBlinkRight"] !== undefined) infl[dict["eyeBlinkRight"]] = THREE.MathUtils.lerp(infl[dict["eyeBlinkRight"]], blinkVal, 0.4);
      }
    }

    // Head Tracking
    if (headBoneRef.current) {
        const headPos = headBoneRef.current.position;
        const lookVector = new THREE.Vector3().subVectors(camera.position, headPos).normalize();
        
        let targetYaw = Math.atan2(lookVector.x, lookVector.z); 
        let targetPitch = -Math.asin(lookVector.y);

        const idleYaw = Math.sin(t * 0.5) * 0.05 + Math.sin(t * 1.2) * 0.02;
        const idlePitch = Math.cos(t * 0.3) * 0.03;
        const idleRoll = Math.sin(t * 0.7) * 0.02;

        let nodOffsetPitch = 0;
        if (userSpeaking) {
            if (!isNoddingRef.current && time > nodTimerRef.current) {
                if (Math.random() > 0.7) { 
                    isNoddingRef.current = true;
                    nodStartTimeRef.current = time;
                    nodDurationRef.current = 0.5 + Math.random() * 0.5; 
                }
                nodTimerRef.current = time + 2 + Math.random() * 3; 
            }
            
            if (isNoddingRef.current) {
                const nodProgress = (time - nodStartTimeRef.current) / nodDurationRef.current;
                if (nodProgress >= 1) {
                    isNoddingRef.current = false;
                } else {
                    nodOffsetPitch = Math.sin(nodProgress * Math.PI * 2) * 0.15; 
                }
            }
        }

        if (userSpeaking) {
            targetYaw += idleYaw * 0.3; 
            targetPitch += idlePitch * 0.3 + nodOffsetPitch; 
            
            const listenTilt = -0.05; 
            headBoneRef.current.rotation.z = THREE.MathUtils.lerp(headBoneRef.current.rotation.z, listenTilt, 0.05);
        } else {
            targetYaw += idleYaw;
            targetPitch += idlePitch;
            headBoneRef.current.rotation.z = THREE.MathUtils.lerp(headBoneRef.current.rotation.z, idleRoll, 0.05);
        }

        if (amp > 0.1) {
            targetPitch += Math.sin(t * 12) * amp * 0.05;
            targetYaw += Math.sin(t * 4) * amp * 0.03;
            targetPitch -= 0.05; 
        }

        const MAX_YAW = 1.0; 
        const MAX_PITCH = 0.6;
        
        targetYaw = THREE.MathUtils.clamp(targetYaw, -MAX_YAW, MAX_YAW);
        targetPitch = THREE.MathUtils.clamp(targetPitch, -MAX_PITCH, MAX_PITCH);

        headBoneRef.current.rotation.y = THREE.MathUtils.lerp(headBoneRef.current.rotation.y, targetYaw, 0.1);
        headBoneRef.current.rotation.x = THREE.MathUtils.lerp(headBoneRef.current.rotation.x, targetPitch, 0.1);
    }
    
    if (spineBoneRef.current && headBoneRef.current) {
        spineBoneRef.current.rotation.y = THREE.MathUtils.lerp(spineBoneRef.current.rotation.y, headBoneRef.current.rotation.y * 0.2, 0.05);
        spineBoneRef.current.rotation.x = THREE.MathUtils.lerp(spineBoneRef.current.rotation.x, headBoneRef.current.rotation.x * 0.2, 0.05);
    }

    const saccadeX = (Math.random() - 0.5) * 0.02;
    const saccadeY = (Math.random() - 0.5) * 0.02;
    const doSaccade = Math.random() > 0.95; 

    const eyeTarget = camera.position.clone();
    if (doSaccade && !userSpeaking) {
        eyeTarget.x += saccadeX;
        eyeTarget.y += saccadeY;
    }

    if (leftEyeRef.current) leftEyeRef.current.lookAt(eyeTarget);
    if (rightEyeRef.current) rightEyeRef.current.lookAt(eyeTarget);

  });

  return (
    <group ref={group} scale={1.35}>
      <primitive object={scene} />
    </group>
  );
};

export default Avatar;
useGLTF.preload(AVATAR_URL);
