import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ConnectionState } from '../types';

const AVATAR_URL =
  "https://models.readyplayer.me/69189159786317131c5bb99a.glb?morphTargets=ARKit,Oculus%20Visemes";

interface AvatarProps {
  modelAmplitude: number;
  userSpeaking: boolean;
  connectionState: ConnectionState;
}

const Avatar: React.FC<AvatarProps> = ({
  modelAmplitude,
  userSpeaking,
  connectionState,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(AVATAR_URL) as any;

  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const leftEyeRef = useRef<THREE.Object3D | null>(null);
  const rightEyeRef = useRef<THREE.Object3D | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);

  // ------------------------------------------------------------
  // IDENTIFY NODES
  // ------------------------------------------------------------
  useEffect(() => {
    scene.traverse((child: any) => {

      // Remove body meshes
      if (
        child.name.includes("Wolf3D_Body") ||
        child.name.includes("Outfit") ||
        child.name.includes("Bottom") ||
        child.name.includes("Top") ||
        child.name.includes("Footwear")
      ) {
        child.visible = false;
      }

      // Head mesh for morph targets
      if (child.isSkinnedMesh && (child.name.includes("Head") || child.name.includes("Wolf3D_Head"))) {
        headMeshRef.current = child;
      }

      // Head bone for rotation
      if (child.isBone && child.name === 'Head') {
        headBoneRef.current = child;
      }

      // Eyes for tracking
      if (child.name === "EyeLeft" || child.name === "LeftEye") {
        leftEyeRef.current = child;
      }
      if (child.name === "EyeRight" || child.name === "RightEye") {
        rightEyeRef.current = child;
      }
    });
  }, [scene]);


  // ------------------------------------------------------------
  // FRAME LOOP
  // ------------------------------------------------------------
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();

    // ---------------------------
    // LIP SYNC
    // ---------------------------
    if (headMeshRef.current) {
      const dict = headMeshRef.current.morphTargetDictionary;
      const infl = headMeshRef.current.morphTargetInfluences;

      if (dict && infl) {
        const mouth =
          dict["viseme_aa"] ||
          dict["viseme_ih"] ||
          dict["jawOpen"] ||
          dict["mouthOpen"];

        if (mouth !== undefined) {
          const target = Math.min(modelAmplitude * 2.2, 1.0);
          infl[mouth] = THREE.MathUtils.lerp(infl[mouth], target, 0.35);
        }
      }
    }

    // ---------------------------
    // BLINK
    // ---------------------------
    if (headMeshRef.current) {
      const dict = headMeshRef.current.morphTargetDictionary;
      const infl = headMeshRef.current.morphTargetInfluences;

      if (dict && infl) {
        const blinkAmount = Math.max(0, -Math.cos(time * 0.45) - 0.5) * 2;

        if (dict["eyeBlinkLeft"] !== undefined)
          infl[dict["eyeBlinkLeft"]] = blinkAmount;

        if (dict["eyeBlinkRight"] !== undefined)
          infl[dict["eyeBlinkRight"]] = blinkAmount;
      }
    }

    // ---------------------------
    // EYE TRACKING
    // ---------------------------
    const eyeTarget = new THREE.Vector3(
      camera.position.x,
      camera.position.y,   // Look at camera height
      camera.position.z
    );

    if (leftEyeRef.current) leftEyeRef.current.lookAt(eyeTarget);
    if (rightEyeRef.current) rightEyeRef.current.lookAt(eyeTarget);

    // ---------------------------
    // HEAD TILT AND IDLE MOVEMENT
    // ---------------------------
    if (headBoneRef.current) {
      // Correct head to look forward by tilting it up.
      // A negative value here tilts the chin up.
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.x,
        -0.3, // Using a negative value to tilt the head UP.
        0.1
      );

      // Reset sideways tilt and add subtle idle animation
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        Math.sin(time * 0.5) * 0.05, // Subtle side-to-side idle movement
        0.1
      );
    }
  });

  return (
    <group ref={group} scale={1.35}>
      <primitive object={scene} />
    </group>
  );
};

export default Avatar;
useGLTF.preload(AVATAR_URL);