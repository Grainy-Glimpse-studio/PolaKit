import { useRef, useMemo, useState, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// Mouse position context for sharing across components
const MouseContext = createContext<React.RefObject<THREE.Vector3> | null>(null);

// Audio context for block tap sounds
let audioContext: AudioContext | null = null;
let audioReady = false;
let lastSoundTime = 0;
const SOUND_COOLDOWN = 50; // Minimum ms between sounds

// Initialize audio on first user interaction
function initAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  // Play a silent sound to fully unlock audio
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

  // Resume if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Simple percussive "tap" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Random pitch variation for natural feel
  const baseFreq = 600 + pitch * 500;
  oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    baseFreq * 0.4,
    audioContext.currentTime + 0.04
  );

  // Quick fade out - very subtle volume
  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.06);
}

// Component to track mouse position in 3D space
function MouseTracker({ mouseRef }: { mouseRef: React.RefObject<THREE.Vector3> }) {
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    if (!mouseRef.current) return;
    // Project mouse to a plane at z=0
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

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  path: string;
}

// Polaroid rainbow colors
const COLORS = [
  new THREE.Color('#FF6B6B'),
  new THREE.Color('#FFE66D'),
  new THREE.Color('#4ECDC4'),
  new THREE.Color('#45B7D1'),
  new THREE.Color('#96CEB4'),
];

// Single pixel block with enhanced 3D depth and mouse interaction
function PixelBlock({
  position,
  colorIndex,
  pixelIndex,
}: {
  position: [number, number, number];
  colorIndex: number;
  pixelIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = COLORS[colorIndex];
  const mouseRef = useContext(MouseContext);

  // Store current offset for smooth animation
  const offsetRef = useRef({ x: 0, y: 0, z: 0 });
  // Track if mouse was previously inside to trigger sound only on enter
  const wasInsideRef = useRef(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Mouse interaction - get actual world position of this block
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

      // Play sound when mouse enters the sound radius
      if (isInside && !wasInsideRef.current) {
        const pitch = ((position[0] + position[1]) % 1 + Math.random() * 0.3);
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

    // Smooth spring animation back to original position
    const springStrength = 0.15;
    offsetRef.current.x += (targetOffsetX - offsetRef.current.x) * springStrength;
    offsetRef.current.y += (targetOffsetY - offsetRef.current.y) * springStrength;
    offsetRef.current.z += (targetOffsetZ - offsetRef.current.z) * springStrength;

    // Subtle individual floating for each block
    const floatPhase = pixelIndex * 0.7; // Different phase per block
    const subtleFloatZ = Math.sin(time * 0.8 + floatPhase) * 0.012;
    const subtleFloatY = Math.sin(time * 0.6 + floatPhase * 1.3) * 0.008;
    const subtleFloatX = Math.cos(time * 0.5 + floatPhase * 0.9) * 0.006;

    // Apply offset to position
    meshRef.current.position.set(
      position[0] + offsetRef.current.x + subtleFloatX,
      position[1] + offsetRef.current.y + subtleFloatY,
      position[2] + offsetRef.current.z + subtleFloatZ
    );

    // Diagonal shine effect
    const diagonalPos = position[0] + position[1];
    const shineOffset = ((time * 1.5) % 6) - 3;
    const shineDistance = Math.abs(diagonalPos - shineOffset);
    const shineWidth = 1.2;

    // Color speed based on mouse proximity
    const mouseDistance = mouseRef?.current
      ? Math.sqrt(
          (worldPos.x - mouseRef.current.x) ** 2 +
          (worldPos.y - mouseRef.current.y) ** 2
        )
      : 999;
    const colorSpeedBoost = mouseDistance < 2 ? (1 - mouseDistance / 2) * 0.5 : 0;
    const colorSpeed = 0.12 + colorSpeedBoost;

    // Gradient based on position, with speed boost when mouse is close
    const positionGradient = (position[0] + position[1]) * 0.15;
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

    // Brighten when mouse is pushing
    const pushBrightness = Math.sqrt(offsetRef.current.x ** 2 + offsetRef.current.y ** 2) * 3;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    // Clay: matte, soft colors
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
      position={position}
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

// Neon text with color animation
function NeonText({
  text,
  yOffset,
  xOffset = 0,
  fontSize,
  index,
  isHovered,
}: {
  text: string;
  yOffset: number;
  xOffset?: number;
  fontSize: number;
  index: number;
  isHovered: boolean;
}) {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!textRef.current) return;
    const time = state.clock.elapsedTime;

    const hueShift = (time * 0.25 + index * 0.3) % 1;
    const material = textRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hueShift, 0.85, 0.65);
    material.emissive.setHSL(hueShift, 0.9, isHovered ? 0.6 : 0.4);
  });

  return (
    <Text
      ref={textRef}
      position={[xOffset, yOffset, 0.2]}
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
      />
    </Text>
  );
}

// Single Polaroid card
function PolaroidCard({
  tool,
  index,
  basePosition,
  hoveredIndex,
  setHoveredIndex,
  onSelect,
}: {
  tool: Tool;
  index: number;
  basePosition: [number, number, number];
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  onSelect: (path: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isHovered = hoveredIndex === index;
  const mouseRef = useContext(MouseContext);

  // Store current tilt for smooth animation
  const tiltRef = useRef({ x: 0, y: 0 });
  // Store pulse scale
  const pulseRef = useRef(1);

  // Larger frame
  const pixelSize = 0.29;
  const cols = 12;
  const rows = 15;

  const pixels = useMemo(() => {
    const result: { pos: [number, number, number]; colorIndex: number }[] = [];

    const thinBorder = 1;
    const thickBorder = 3;

    const offsetX = -(cols * pixelSize) / 2;
    const offsetY = -(rows * pixelSize) / 2;

    // Seeded random for consistent Z offsets
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        let shouldDraw = false;

        if (row >= rows - thinBorder) shouldDraw = true;
        else if (row < thickBorder) shouldDraw = true;
        else if (col < thinBorder) shouldDraw = true;
        else if (col >= cols - thinBorder) shouldDraw = true;

        if (shouldDraw) {
          // Add subtle Z variation for depth
          const zOffset = (seededRandom(col * 100 + row) - 0.5) * 0.04;
          result.push({
            pos: [offsetX + col * pixelSize, offsetY + row * pixelSize, zOffset],
            colorIndex: Math.floor(Math.random() * COLORS.length),
          });
        }
      }
    }

    return result;
  }, []);

  // Calculate center of the image area (inside the frame)
  const frameHeight = rows * pixelSize;
  const topBorderHeight = 1 * pixelSize;
  const bottomBorderHeight = 3 * pixelSize;
  const imageAreaTop = frameHeight / 2 - topBorderHeight;
  const imageAreaBottom = -frameHeight / 2 + bottomBorderHeight;
  const imageAreaCenterY = (imageAreaTop + imageAreaBottom) / 2;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const floatOffset = index * 2;

    // Floating motion
    const floatY = Math.sin(time * 0.5 + floatOffset) * 0.1;
    const floatX = Math.cos(time * 0.3 + floatOffset) * 0.04;

    // Base subtle rotation
    let rotateX = Math.sin(time * 0.4 + floatOffset) * 0.03;
    let rotateY = Math.cos(time * 0.35 + floatOffset) * 0.04;

    // Mouse tilt effect - card tilts toward mouse
    if (mouseRef?.current) {
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Calculate distance from card center to mouse
      const dx = mouseX - basePosition[0];
      const dy = mouseY - basePosition[1];

      // Only apply tilt when mouse is reasonably close
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 4;

      if (distance < maxDistance) {
        const strength = (1 - distance / maxDistance) * 0.25;
        // Tilt toward mouse: rotateY for left/right, rotateX for up/down
        tiltRef.current.y += (dx * strength - tiltRef.current.y) * 0.08;
        tiltRef.current.x += (-dy * strength - tiltRef.current.x) * 0.08;
      } else {
        // Smoothly return to neutral
        tiltRef.current.y += (0 - tiltRef.current.y) * 0.05;
        tiltRef.current.x += (0 - tiltRef.current.x) * 0.05;
      }

      rotateX += tiltRef.current.x;
      rotateY += tiltRef.current.y;
    }

    // Heartbeat pulse when mouse is close
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
      // Heartbeat pattern: quick beat, pause, quick beat
      const heartbeat = Math.sin(time * 6) * 0.5 + 0.5;
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
      onPointerEnter={() => setHoveredIndex(index)}
      onPointerLeave={() => setHoveredIndex(null)}
      onClick={() => onSelect(tool.path)}
    >
      {/* Pixel frame */}
      {pixels.map((pixel, i) => (
        <PixelBlock
          key={i}
          position={pixel.pos}
          colorIndex={pixel.colorIndex}
          pixelIndex={i + index * 100}
        />
      ))}

      {/* Tool name - manual x offset per card */}
      <NeonText
        text={tool.name}
        yOffset={0.45}
        xOffset={index === 1 ? -0.04 : index === 2 ? -0.11 : 0}
        fontSize={0.29}
        index={index}
        isHovered={isHovered}
      />

      {/* Subtitle - below the name */}
      <NeonText
        text={tool.subtitle}
        yOffset={-0.05}
        xOffset={index === 1 ? -0.04 : index === 2 ? -0.11 : 0}
        fontSize={0.13}
        index={index + 10}
        isHovered={isHovered}
      />
    </group>
  );
}

// All three polaroids in one scene
function Scene({ tools }: { tools: Tool[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const mouseRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const positions: [number, number, number][] = [
    [-4.3, 0, 0],
    [0, 0, 0],
    [4.3, 0, 0],
  ];

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <MouseContext.Provider value={mouseRef}>
      {/* Mouse position tracker */}
      <MouseTracker mouseRef={mouseRef} />

      {/* Ambient for base illumination */}
      <ambientLight intensity={0.3} />

      {/* Key light - main directional light with shadows at 45 degree angle */}
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

      {/* Fill light - softer, from opposite side */}
      <directionalLight
        position={[-3, 2, 4]}
        intensity={0.4}
        color="#E8E8FF"
      />

      {/* Rim/back light - creates edge definition */}
      <directionalLight
        position={[0, -2, -5]}
        intensity={0.3}
        color="#FFE4E1"
      />

      {/* Colored accent lights for atmosphere */}
      <pointLight position={[-6, 3, 2]} intensity={0.3} color="#4ECDC4" />
      <pointLight position={[6, -2, 3]} intensity={0.25} color="#FF6B6B" />

      {tools.map((tool, index) => (
        <PolaroidCard
          key={tool.id}
          tool={tool}
          index={index}
          basePosition={positions[index]}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          onSelect={handleSelect}
        />
      ))}
    </MouseContext.Provider>
  );
}

interface PolaroidScene3DProps {
  tools: Tool[];
}

export function PolaroidScene3D({ tools }: PolaroidScene3DProps) {
  const handleInteraction = () => {
    // Initialize audio on any user interaction
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
        <Scene tools={tools} />
      </Canvas>
    </div>
  );
}
