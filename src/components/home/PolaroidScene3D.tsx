import { useRef, useMemo, useState, createContext, useContext, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// Animation phase context
type AnimationPhase = 'intro' | 'exploding' | 'forming' | 'main';
const AnimationContext = createContext<{
  phase: AnimationPhase;
  animationProgress: number;
  triggerExplosion: () => void;
}>({
  phase: 'intro',
  animationProgress: 0,
  triggerExplosion: () => {},
});

// Mouse position context for sharing across components
const MouseContext = createContext<React.RefObject<THREE.Vector3> | null>(null);

// Audio context for block tap sounds
let audioContext: AudioContext | null = null;
let audioReady = false;
let lastSoundTime = 0;
const SOUND_COOLDOWN = 50;

function initAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.001);
  audioReady = true;
}

function playBlockTap(pitch: number = 1) {
  if (!audioReady || !audioContext) return;

  const now = Date.now();
  if (now - lastSoundTime < SOUND_COOLDOWN) return;
  lastSoundTime = now;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  const baseFreq = 600 + pitch * 500;
  oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    baseFreq * 0.4,
    audioContext.currentTime + 0.04
  );

  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.06);
}

// Explosion sound
function playExplosionSound() {
  if (!audioReady || !audioContext) return;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Low boom
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(80, audioContext.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
  gain1.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
  osc1.connect(gain1);
  gain1.connect(audioContext.destination);
  osc1.start(audioContext.currentTime);
  osc1.stop(audioContext.currentTime + 0.4);

  // Scatter sounds
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (!audioContext) return;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.frequency.setValueAtTime(300 + Math.random() * 400, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.03, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
    }, i * 30);
  }
}

function MouseTracker({ mouseRef }: { mouseRef: React.RefObject<THREE.Vector3> }) {
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    if (!mouseRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    if (intersection) {
      mouseRef.current.copy(intersection);
    }
  });

  return null;
}

// Mouse-following light for intro phase
function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const mouseRef = useContext(MouseContext);
  const { phase } = useContext(AnimationContext);

  useFrame(() => {
    if (!lightRef.current || !mouseRef?.current) return;

    // Position light at mouse location, slightly in front
    lightRef.current.position.set(
      mouseRef.current.x * 1.5,
      mouseRef.current.y * 1.5,
      3
    );

    // Fade out during explosion
    if (phase === 'intro') {
      lightRef.current.intensity = 2;
    } else {
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 0.1);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color="#ffffff"
      intensity={2}
      distance={10}
      decay={2}
    />
  );
}

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  path: string;
}

const COLORS = [
  new THREE.Color('#FF6B6B'),
  new THREE.Color('#FFE66D'),
  new THREE.Color('#4ECDC4'),
  new THREE.Color('#45B7D1'),
  new THREE.Color('#96CEB4'),
];

// Calculate all final positions for polaroid frames
function calculateAllFinalPositions(pixelSize: number, cols: number, rows: number) {
  const positions: [number, number, number][] = [[-4.3, 0, 0], [0, 0, 0], [4.3, 0, 0]];
  const allPixels: {
    finalPos: [number, number, number];
    cardIndex: number;
    colorIndex: number;
  }[] = [];

  const thinBorder = 1;
  const thickBorder = 3;
  const offsetX = -(cols * pixelSize) / 2;
  const offsetY = -(rows * pixelSize) / 2;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  positions.forEach((cardPos, cardIndex) => {
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        let shouldDraw = false;
        if (row >= rows - thinBorder) shouldDraw = true;
        else if (row < thickBorder) shouldDraw = true;
        else if (col < thinBorder) shouldDraw = true;
        else if (col >= cols - thinBorder) shouldDraw = true;

        if (shouldDraw) {
          const zOffset = (seededRandom(col * 100 + row + cardIndex * 1000) - 0.5) * 0.04;
          allPixels.push({
            finalPos: [
              cardPos[0] + offsetX + col * pixelSize,
              cardPos[1] + offsetY + row * pixelSize,
              cardPos[2] + zOffset,
            ],
            cardIndex,
            colorIndex: Math.floor(seededRandom(col * 50 + row + cardIndex * 500) * COLORS.length),
          });
        }
      }
    }
  });

  return allPixels;
}

// Calculate cube positions for intro - returns full cube (216 positions for 6x6x6)
function calculateCubePositions(blockSize: number) {
  const cubePositions: [number, number, number][] = [];
  const side = 6; // 6x6x6 = 216
  const offset = (side * blockSize) / 2 - blockSize / 2;

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        cubePositions.push([
          x * blockSize - offset,
          y * blockSize - offset,
          z * blockSize - offset,
        ]);
      }
    }
  }

  return cubePositions; // Always 216 positions
}

// Animated block that transitions from cube to polaroid
function AnimatedBlock({
  cubePos,
  finalPos,
  colorIndex,
  pixelIndex,
  cardIndex,
}: {
  cubePos: [number, number, number];
  finalPos: [number, number, number];
  colorIndex: number;
  pixelIndex: number;
  cardIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = COLORS[colorIndex];
  const mouseRef = useContext(MouseContext);
  const { phase, animationProgress } = useContext(AnimationContext);

  const offsetRef = useRef({ x: 0, y: 0, z: 0 });
  const wasInsideRef = useRef(false);
  const floatFadeRef = useRef(0); // Fade in floating effects gradually

  // Random explosion direction
  const explosionDir = useMemo(() => ({
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 4 + 2,
    rotX: (Math.random() - 0.5) * 10,
    rotY: (Math.random() - 0.5) * 10,
    rotZ: (Math.random() - 0.5) * 10,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    let targetX: number, targetY: number, targetZ: number;
    let rotX = 0, rotY = 0, rotZ = 0;
    let scale = 1;

    if (phase === 'intro') {
      // In cube formation
      targetX = cubePos[0];
      targetY = cubePos[1];
      targetZ = cubePos[2];

      // Gentle rotation of entire cube handled by parent
      // Individual blocks just sit in place with subtle breathing
      const breathe = Math.sin(time * 2 + pixelIndex * 0.1) * 0.02;
      scale = 1 + breathe;

    } else if (phase === 'exploding' || phase === 'forming') {
      // Unified explosion + forming animation
      const t = Math.min(1, animationProgress);

      // Smooth easing function (ease out cubic) - no bounce
      const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

      // Phase 1: Explosion outward (0 - 0.3)
      const explosionT = Math.min(1, t / 0.3);
      const explosionEase = easeOutCubic(explosionT);

      // Phase 2: Settle to final position (0.2 - 1.0)
      const settleT = Math.max(0, (t - 0.2) / 0.8);
      let settleEase = easeOutCubic(settleT);

      // Snap to 1 when very close to avoid floating point precision jump
      if (settleEase > 0.999) settleEase = 1;

      // Explosion offset fades as we settle
      const explosionFade = 1 - settleEase;
      const explodeX = explosionDir.x * explosionEase * explosionFade;
      const explodeY = explosionDir.y * explosionEase * explosionFade;
      const explodeZ = explosionDir.z * explosionEase * explosionFade;

      // Blend from cube position through explosion to final position
      targetX = cubePos[0] + explodeX + (finalPos[0] - cubePos[0]) * settleEase;
      targetY = cubePos[1] + explodeY + (finalPos[1] - cubePos[1]) * settleEase;
      targetZ = cubePos[2] + explodeZ + (finalPos[2] - cubePos[2]) * settleEase;

      // Rotation settles to zero
      rotX = explosionDir.rotX * explosionEase * explosionFade;
      rotY = explosionDir.rotY * explosionEase * explosionFade;
      rotZ = explosionDir.rotZ * explosionEase * explosionFade;

      // Scale stays at 1
      scale = 1;

    } else {
      // Main phase - normal polaroid behavior
      // finalPos is now relative to card center
      targetX = finalPos[0];
      targetY = finalPos[1];
      targetZ = finalPos[2];

      // Mouse interaction - use world position for accurate distance
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);

      let targetOffsetX = 0;
      let targetOffsetY = 0;
      let targetOffsetZ = 0;

      if (mouseRef?.current) {
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;

        const dx = worldPos.x - mouseX;
        const dy = worldPos.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const interactionRadius = 0.5;
        const soundRadius = 0.3;
        const maxPush = 0.06;

        const isInside = distance < soundRadius;

        if (isInside && !wasInsideRef.current) {
          const pitch = ((worldPos.x + worldPos.y) % 1 + Math.random() * 0.3);
          playBlockTap(pitch);
        }
        wasInsideRef.current = isInside;

        if (distance < interactionRadius && distance > 0) {
          const strength = (1 - distance / interactionRadius) ** 2 * maxPush;
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          targetOffsetX = normalizedDx * strength;
          targetOffsetY = normalizedDy * strength;
          targetOffsetZ = strength * 0.3;
        }
      }

      const springStrength = 0.15;
      offsetRef.current.x += (targetOffsetX - offsetRef.current.x) * springStrength;
      offsetRef.current.y += (targetOffsetY - offsetRef.current.y) * springStrength;
      offsetRef.current.z += (targetOffsetZ - offsetRef.current.z) * springStrength;

      const floatPhase = pixelIndex * 0.7;
      const subtleFloatZ = Math.sin(time * 0.8 + floatPhase) * 0.012;
      const subtleFloatY = Math.sin(time * 0.6 + floatPhase * 1.3) * 0.008;
      const subtleFloatX = Math.cos(time * 0.5 + floatPhase * 0.9) * 0.006;

      // Gradually fade in floating effects to avoid jump when entering main phase
      floatFadeRef.current = Math.min(1, floatFadeRef.current + 0.02);

      targetX += (offsetRef.current.x + subtleFloatX) * floatFadeRef.current;
      targetY += (offsetRef.current.y + subtleFloatY) * floatFadeRef.current;
      targetZ += (offsetRef.current.z + subtleFloatZ) * floatFadeRef.current;
    }

    meshRef.current.position.set(targetX, targetY, targetZ);
    meshRef.current.rotation.set(rotX, rotY, rotZ);
    meshRef.current.scale.setScalar(scale);

    // Color animation - use world position for consistent effect
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);

    const diagonalPos = worldPos.x + worldPos.y;
    const shineOffset = ((time * 1.5) % 6) - 3;
    const shineDistance = Math.abs(diagonalPos - shineOffset);
    const shineWidth = 1.2;

    const colorSpeed = 0.12;
    const positionGradient = (worldPos.x + worldPos.y) * 0.15;
    const hueShift = (time * colorSpeed + positionGradient) % 1;

    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    hsl.h = (hsl.h + hueShift) % 1;

    let brightness = 0.5;
    let emissiveIntensity = 0.15;
    if (shineDistance < shineWidth) {
      const shine = 1 - shineDistance / shineWidth;
      brightness = 0.5 + shine * 0.5;
      emissiveIntensity = 0.15 + shine * 0.4;
    }
    hsl.l = Math.min(0.7, brightness);

    const pushBrightness = Math.sqrt(offsetRef.current.x ** 2 + offsetRef.current.y ** 2) * 3;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hsl.h, 0.6, Math.min(0.7, 0.55 + pushBrightness * 0.5));
    material.emissive.setHSL(hsl.h, 0.5, 0.08 + pushBrightness * 0.1);
    material.emissiveIntensity = 0.05 + emissiveIntensity * 0.15 + pushBrightness * 0.3;
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[0.23, 0.23, 0.18]}
      radius={0.025}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={0.05}
        roughness={0.9}
        metalness={0}
      />
    </RoundedBox>
  );
}

// Ghost block that fades out during explosion
function GhostBlock({
  cubePos,
  colorIndex,
  pixelIndex,
}: {
  cubePos: [number, number, number];
  colorIndex: number;
  pixelIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = COLORS[colorIndex];
  const { phase, animationProgress } = useContext(AnimationContext);

  // Random explosion direction
  const explosionDir = useMemo(() => ({
    x: (Math.random() - 0.5) * 6,
    y: (Math.random() - 0.5) * 6,
    z: (Math.random() - 0.5) * 4 + 2,
    rotX: (Math.random() - 0.5) * 8,
    rotY: (Math.random() - 0.5) * 8,
    rotZ: (Math.random() - 0.5) * 8,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    if (phase === 'intro') {
      meshRef.current.position.set(cubePos[0], cubePos[1], cubePos[2]);
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.scale.setScalar(1);

      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 1;

    } else if (phase === 'exploding' || phase === 'forming') {
      // Explode and fade out
      const t = Math.min(1, animationProgress * 3); // Fade out faster
      const easeOut = 1 - Math.pow(1 - t, 3);

      meshRef.current.position.set(
        cubePos[0] + explosionDir.x * easeOut,
        cubePos[1] + explosionDir.y * easeOut,
        cubePos[2] + explosionDir.z * easeOut
      );
      meshRef.current.rotation.set(
        explosionDir.rotX * easeOut,
        explosionDir.rotY * easeOut,
        explosionDir.rotZ * easeOut
      );

      // Shrink and fade
      const fadeOut = 1 - Math.min(1, animationProgress * 2.5);
      meshRef.current.scale.setScalar(Math.max(0, fadeOut));

      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = Math.max(0, fadeOut);
    }

    // Color animation
    const hueShift = (time * 0.12 + pixelIndex * 0.02) % 1;
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    hsl.h = (hsl.h + hueShift) % 1;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hsl.h, 0.6, 0.55);
    material.emissive.setHSL(hsl.h, 0.5, 0.08);
  });

  // Don't render in main phase
  if (phase === 'main') return null;

  return (
    <RoundedBox
      ref={meshRef}
      args={[0.23, 0.23, 0.18]}
      radius={0.025}
      smoothness={3}
      position={cubePos}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={0.05}
        roughness={0.9}
        metalness={0}
        transparent
        opacity={1}
      />
    </RoundedBox>
  );
}

// Rotating cube group for intro
function IntroCube({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useContext(MouseContext);
  const { phase } = useContext(AnimationContext);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'intro') return;

    const time = state.clock.elapsedTime;

    // Base gentle rotation
    let rotY = time * 0.3;
    let rotX = Math.sin(time * 0.2) * 0.2;

    // Mouse influence on rotation
    if (mouseRef?.current) {
      rotY += mouseRef.current.x * 0.3;
      rotX += -mouseRef.current.y * 0.3;
    }

    groupRef.current.rotation.set(rotX, rotY, 0);
  });

  return (
    <group ref={groupRef} onClick={onClick}>
      {children}
    </group>
  );
}

// Neon text with color animation and fade-in
function NeonText({
  text,
  yOffset,
  xOffset = 0,
  fontSize,
  index,
  isHovered,
  cardPosition,
}: {
  text: string;
  yOffset: number;
  xOffset?: number;
  fontSize: number;
  index: number;
  isHovered: boolean;
  cardPosition: [number, number, number];
}) {
  const textRef = useRef<THREE.Mesh>(null);
  const { phase, animationProgress } = useContext(AnimationContext);

  useFrame((state) => {
    if (!textRef.current) return;
    const time = state.clock.elapsedTime;

    // Fade in during exploding/forming phase
    let opacity = 0;
    if (phase === 'exploding' || phase === 'forming') {
      // Start fading in at 35%, fully visible at 95%
      opacity = Math.max(0, Math.min(1, (animationProgress - 0.35) / 0.6));
    } else if (phase === 'main') {
      opacity = 1;
    }

    const hueShift = (time * 0.25 + index * 0.3) % 1;
    const material = textRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hueShift, 0.85, 0.65);
    material.emissive.setHSL(hueShift, 0.9, isHovered ? 0.6 : 0.4);
    material.opacity = opacity;
    material.transparent = true;
  });

  if (phase === 'intro') return null;

  return (
    <Text
      ref={textRef}
      position={[cardPosition[0] + xOffset, cardPosition[1] + yOffset, 0.2]}
      fontSize={fontSize}
      font="/fonts/PressStart2P-Regular.ttf"
      anchorX="center"
      anchorY="middle"
      textAlign="center"
    >
      {text}
      <meshStandardMaterial
        color="#FF6B6B"
        emissive="#FF6B6B"
        emissiveIntensity={0.4}
        roughness={0.3}
        transparent
        opacity={0}
      />
    </Text>
  );
}

// Polaroid card group with floating, tilt, and pulse effects
function PolaroidCardGroup({
  tool,
  cardIndex,
  basePosition,
  pixels,
  cubePositions,
  globalPixelStartIndex,
  hoveredIndex,
  setHoveredIndex,
  onSelect,
}: {
  tool: Tool;
  cardIndex: number;
  basePosition: [number, number, number];
  pixels: { finalPos: [number, number, number]; colorIndex: number }[];
  cubePositions: [number, number, number][];
  globalPixelStartIndex: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  onSelect: (path: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useContext(MouseContext);
  const { phase } = useContext(AnimationContext);
  const isHovered = hoveredIndex === cardIndex;

  const tiltRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(1);

  useFrame((state) => {
    if (!groupRef.current || phase !== 'main') return;

    const time = state.clock.elapsedTime;
    const floatOffset = cardIndex * 2;

    // Floating motion
    const floatY = Math.sin(time * 0.5 + floatOffset) * 0.1;
    const floatX = Math.cos(time * 0.3 + floatOffset) * 0.04;

    // Base subtle rotation
    let rotateX = Math.sin(time * 0.4 + floatOffset) * 0.03;
    let rotateY = Math.cos(time * 0.35 + floatOffset) * 0.04;

    // Mouse tilt effect
    if (mouseRef?.current) {
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      const dx = mouseX - basePosition[0];
      const dy = mouseY - basePosition[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 4;

      if (distance < maxDistance) {
        const strength = (1 - distance / maxDistance) * 0.25;
        tiltRef.current.y += (dx * strength - tiltRef.current.y) * 0.08;
        tiltRef.current.x += (-dy * strength - tiltRef.current.x) * 0.08;
      } else {
        tiltRef.current.y += (0 - tiltRef.current.y) * 0.05;
        tiltRef.current.x += (0 - tiltRef.current.x) * 0.05;
      }

      rotateX += tiltRef.current.x;
      rotateY += tiltRef.current.y;
    }

    // Heartbeat pulse
    const distance = mouseRef?.current
      ? Math.sqrt(
          (mouseRef.current.x - basePosition[0]) ** 2 +
          (mouseRef.current.y - basePosition[1]) ** 2
        )
      : 999;

    const maxPulseDistance = 3;
    let targetScale = 1;

    if (distance < maxPulseDistance) {
      const pulseStrength = (1 - distance / maxPulseDistance) * 0.08;
      const doubleBeat = Math.max(
        Math.sin(time * 8) * 0.5 + 0.5,
        Math.sin(time * 8 + 0.4) * 0.3 + 0.3
      );
      targetScale = 1 + doubleBeat * pulseStrength;
    }

    pulseRef.current += (targetScale - pulseRef.current) * 0.1;

    groupRef.current.position.set(
      basePosition[0] + floatX,
      basePosition[1] + floatY,
      basePosition[2]
    );
    groupRef.current.rotation.set(rotateX, rotateY, 0);
    groupRef.current.scale.setScalar(pulseRef.current);
  });

  return (
    <group
      ref={groupRef}
      position={basePosition}
      onPointerEnter={() => phase === 'main' && setHoveredIndex(cardIndex)}
      onPointerLeave={() => setHoveredIndex(null)}
      onClick={() => phase === 'main' && onSelect(tool.path)}
    >
      {/* Pixel blocks - positions are relative to card center */}
      {pixels.map((pixel, i) => (
        <AnimatedBlock
          key={i}
          cubePos={cubePositions[globalPixelStartIndex + i]}
          finalPos={[
            pixel.finalPos[0] - basePosition[0],
            pixel.finalPos[1] - basePosition[1],
            pixel.finalPos[2] - basePosition[2],
          ]}
          colorIndex={pixel.colorIndex}
          pixelIndex={globalPixelStartIndex + i}
          cardIndex={cardIndex}
        />
      ))}

      {/* Text labels */}
      <NeonText
        text={tool.name}
        yOffset={0.45}
        xOffset={cardIndex === 1 ? -0.04 : cardIndex === 2 ? -0.11 : 0}
        fontSize={0.29}
        index={cardIndex}
        isHovered={isHovered}
        cardPosition={[0, 0, 0]}
      />
      <NeonText
        text={tool.subtitle}
        yOffset={-0.05}
        xOffset={cardIndex === 1 ? -0.04 : cardIndex === 2 ? -0.11 : 0}
        fontSize={0.13}
        index={cardIndex + 10}
        isHovered={isHovered}
        cardPosition={[0, 0, 0]}
      />
    </group>
  );
}

// Main scene with all animations
function Scene({ tools, onExplosion }: { tools: Tool[]; onExplosion?: () => void }) {
  const [phase, setPhase] = useState<AnimationPhase>('intro');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const mouseRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const animationStartRef = useRef<number | null>(null);

  const pixelSize = 0.29;
  const cols = 12;
  const rows = 15;

  // Calculate all positions
  const allPixels = useMemo(
    () => calculateAllFinalPositions(pixelSize, cols, rows),
    []
  );

  // Full cube positions (216 = 6x6x6)
  const cubePositions = useMemo(
    () => calculateCubePositions(0.25),
    []
  );

  // Ghost block positions (the extra 6 to complete the cube)
  const ghostBlockCount = 216 - allPixels.length; // Should be 6
  const ghostBlockPositions = useMemo(
    () => cubePositions.slice(allPixels.length),
    [cubePositions, allPixels.length]
  );

  const cardPositions: [number, number, number][] = [[-4.3, 0, 0], [0, 0, 0], [4.3, 0, 0]];

  // Group pixels by card
  const pixelsByCard = useMemo(() => {
    const cards: { finalPos: [number, number, number]; colorIndex: number }[][] = [[], [], []];
    allPixels.forEach((pixel) => {
      cards[pixel.cardIndex].push({
        finalPos: pixel.finalPos,
        colorIndex: pixel.colorIndex,
      });
    });
    return cards;
  }, [allPixels]);

  // Calculate start indices for each card
  const cardStartIndices = useMemo(() => {
    let index = 0;
    return pixelsByCard.map((card) => {
      const start = index;
      index += card.length;
      return start;
    });
  }, [pixelsByCard]);

  const triggerExplosion = useCallback(() => {
    if (phase !== 'intro') return;
    initAudio();
    playExplosionSound();
    setPhase('exploding');
    animationStartRef.current = null;
    // Notify parent to sync background animation
    onExplosion?.();
  }, [phase, onExplosion]);

  // Animation loop
  useFrame((state) => {
    if (phase === 'exploding' || phase === 'forming') {
      if (animationStartRef.current === null) {
        animationStartRef.current = state.clock.elapsedTime;
      }

      const elapsed = state.clock.elapsedTime - animationStartRef.current;
      const duration = 2;
      const progress = Math.min(1, elapsed / duration);
      setAnimationProgress(progress);

      if (phase === 'exploding' && progress > 0.3) {
        setPhase('forming');
      }

      if (progress >= 1) {
        setPhase('main');
      }
    }
  });

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <AnimationContext.Provider value={{ phase, animationProgress, triggerExplosion }}>
      <MouseContext.Provider value={mouseRef}>
        <MouseTracker mouseRef={mouseRef} />

        {/* Ambient light */}
        <ambientLight intensity={phase === 'intro' ? 0.15 : 0.3} />

        {/* Mouse-following light for intro */}
        {(phase === 'intro' || phase === 'exploding') && <MouseLight />}

        {/* Standard lights for main view */}
        {(phase === 'forming' || phase === 'main') && (
          <>
            <directionalLight
              position={[4, 6, 8]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-3, 2, 4]} intensity={0.4} color="#E8E8FF" />
            <directionalLight position={[0, -2, -5]} intensity={0.3} color="#FFE4E1" />
            <pointLight position={[-6, 3, 2]} intensity={0.3} color="#4ECDC4" />
            <pointLight position={[6, -2, 3]} intensity={0.25} color="#FF6B6B" />
          </>
        )}

        {/* Intro cube */}
        {phase === 'intro' && (
          <IntroCube onClick={triggerExplosion}>
            {allPixels.map((pixel, i) => (
              <AnimatedBlock
                key={i}
                cubePos={cubePositions[i]}
                finalPos={pixel.finalPos}
                colorIndex={pixel.colorIndex}
                pixelIndex={i}
                cardIndex={pixel.cardIndex}
              />
            ))}
            {/* Ghost blocks to complete the cube */}
            {ghostBlockPositions.map((pos, i) => (
              <GhostBlock
                key={`ghost-${i}`}
                cubePos={pos}
                colorIndex={i % COLORS.length}
                pixelIndex={allPixels.length + i}
              />
            ))}
          </IntroCube>
        )}

        {/* Exploding/forming - blocks without card grouping */}
        {(phase === 'exploding' || phase === 'forming') && (
          <group>
            {allPixels.map((pixel, i) => (
              <AnimatedBlock
                key={i}
                cubePos={cubePositions[i]}
                finalPos={pixel.finalPos}
                colorIndex={pixel.colorIndex}
                pixelIndex={i}
                cardIndex={pixel.cardIndex}
              />
            ))}
            {/* Ghost blocks fade out during explosion */}
            {ghostBlockPositions.map((pos, i) => (
              <GhostBlock
                key={`ghost-${i}`}
                cubePos={pos}
                colorIndex={i % COLORS.length}
                pixelIndex={allPixels.length + i}
              />
            ))}
          </group>
        )}

        {/* Text labels - fade in during explosion */}
        {(phase === 'exploding' || phase === 'forming') && tools.map((tool, cardIndex) => (
          <group key={`text-${tool.id}`}>
            <NeonText
              text={tool.name}
              yOffset={0.45}
              xOffset={cardIndex === 1 ? -0.04 : cardIndex === 2 ? -0.11 : 0}
              fontSize={0.29}
              index={cardIndex}
              isHovered={false}
              cardPosition={cardPositions[cardIndex]}
            />
            <NeonText
              text={tool.subtitle}
              yOffset={-0.05}
              xOffset={cardIndex === 1 ? -0.04 : cardIndex === 2 ? -0.11 : 0}
              fontSize={0.13}
              index={cardIndex + 10}
              isHovered={false}
              cardPosition={cardPositions[cardIndex]}
            />
          </group>
        ))}

        {/* Main phase - grouped cards with full interactivity */}
        {phase === 'main' && tools.map((tool, cardIndex) => (
          <PolaroidCardGroup
            key={tool.id}
            tool={tool}
            cardIndex={cardIndex}
            basePosition={cardPositions[cardIndex]}
            pixels={pixelsByCard[cardIndex]}
            cubePositions={cubePositions}
            globalPixelStartIndex={cardStartIndices[cardIndex]}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            onSelect={handleSelect}
          />
        ))}

        {/* Click hint for intro */}
        {phase === 'intro' && (
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.15}
            font="/fonts/PressStart2P-Regular.ttf"
            anchorX="center"
            anchorY="middle"
            color="#ffffff"
          >
            CLICK TO ENTER
            <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </Text>
        )}
      </MouseContext.Provider>
    </AnimationContext.Provider>
  );
}

interface PolaroidScene3DProps {
  tools: Tool[];
  onExplosion?: () => void;
}

export function PolaroidScene3D({ tools, onExplosion }: PolaroidScene3DProps) {
  const handleInteraction = () => {
    if (!audioReady) {
      initAudio();
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '650px',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      onPointerDown={handleInteraction}
      onPointerMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0.2, 5.5], fov: 60 }}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene tools={tools} onExplosion={onExplosion} />
      </Canvas>
    </div>
  );
}
