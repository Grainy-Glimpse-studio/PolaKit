import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  path: string;
}

interface PixelPolaroid3DProps {
  tool: Tool;
  index: number;
}

// Polaroid rainbow colors
const COLORS = [
  new THREE.Color('#FF6B6B'),
  new THREE.Color('#FFE66D'),
  new THREE.Color('#4ECDC4'),
  new THREE.Color('#45B7D1'),
  new THREE.Color('#96CEB4'),
];

// Single pixel block - NO individual floating, just color animation
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

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Diagonal shine effect
    const diagonalPos = position[0] + position[1];
    const shineOffset = ((time * 1.5) % 6) - 3;
    const shineDistance = Math.abs(diagonalPos - shineOffset);
    const shineWidth = 1.2;

    // Hue rotation
    const hueShift = (time * 0.2 + pixelIndex * 0.008) % 1;

    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    hsl.h = (hsl.h + hueShift) % 1;

    let brightness = 0.5;
    let emissiveIntensity = 0.2;
    if (shineDistance < shineWidth) {
      const shine = 1 - shineDistance / shineWidth;
      brightness = 0.5 + shine * 0.6;
      emissiveIntensity = 0.2 + shine * 0.5;
    }
    hsl.l = Math.min(0.75, brightness);

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hsl.h, hsl.s * 0.85, hsl.l);
    material.emissive.setHSL(hsl.h, hsl.s * 0.6, emissiveIntensity);
  });

  return (
    <mesh ref={meshRef} position={position}>
      {/* Thicker box - 0.15 depth for visible 3D effect */}
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={0.2}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  );
}

// Polaroid frame - all pixels move together as one unit
function PolaroidFrame({ index, hovered }: { index: number; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const pixels = useMemo(() => {
    const result: { pos: [number, number, number]; colorIndex: number }[] = [];

    const pixelSize = 0.17;
    const cols = 12;
    const rows = 15;
    const thinBorder = 1;
    const thickBorder = 3;

    const offsetX = -(cols * pixelSize) / 2;
    const offsetY = -(rows * pixelSize) / 2;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        let shouldDraw = false;

        if (row >= rows - thinBorder) shouldDraw = true;
        else if (row < thickBorder) shouldDraw = true;
        else if (col < thinBorder) shouldDraw = true;
        else if (col >= cols - thinBorder) shouldDraw = true;

        if (shouldDraw) {
          result.push({
            pos: [offsetX + col * pixelSize, offsetY + row * pixelSize, 0],
            colorIndex: Math.floor(Math.random() * COLORS.length),
          });
        }
      }
    }

    return result;
  }, []);

  // Whole frame floating as one unit
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const floatOffset = index * 2;

    // Gentle floating motion for whole frame
    const floatY = Math.sin(time * 0.5 + floatOffset) * 0.12;
    const floatX = Math.cos(time * 0.3 + floatOffset) * 0.05;

    // Subtle rotation to show 3D depth
    const rotateX = Math.sin(time * 0.4 + floatOffset) * 0.1;
    const rotateY = Math.cos(time * 0.35 + floatOffset) * 0.12;

    // Hover effect - move forward instead of scaling
    const targetZ = hovered ? 0.4 : 0;
    const currentZ = groupRef.current.position.z;
    const newZ = currentZ + (targetZ - currentZ) * 0.1;

    groupRef.current.position.set(floatX, floatY, newZ);
    groupRef.current.rotation.set(rotateX, rotateY, 0);
  });

  return (
    <group ref={groupRef}>
      {pixels.map((pixel, i) => (
        <PixelBlock
          key={i}
          position={pixel.pos}
          colorIndex={pixel.colorIndex}
          pixelIndex={i + index * 100}
        />
      ))}
    </group>
  );
}

// Floating text
function CenterText({ text, index, hovered }: { text: string; index: number; hovered: boolean }) {
  const textRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!textRef.current || !groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Match the frame's floating motion
    const floatOffset = index * 2;
    const floatY = Math.sin(time * 0.5 + floatOffset) * 0.12;
    const floatX = Math.cos(time * 0.3 + floatOffset) * 0.05;
    const rotateX = Math.sin(time * 0.4 + floatOffset) * 0.1;
    const rotateY = Math.cos(time * 0.35 + floatOffset) * 0.12;

    const targetZ = hovered ? 0.55 : 0.15;
    const currentZ = groupRef.current.position.z;
    const newZ = currentZ + (targetZ - currentZ) * 0.1;

    groupRef.current.position.set(floatX, floatY + 0.3, newZ);
    groupRef.current.rotation.set(rotateX, rotateY, 0);

    // Color animation
    const hueShift = (time * 0.25 + index * 0.3) % 1;
    const material = textRef.current.material as THREE.MeshStandardMaterial;
    material.color.setHSL(hueShift, 0.85, 0.65);
    material.emissive.setHSL(hueShift, 0.9, hovered ? 0.5 : 0.35);
  });

  return (
    <group ref={groupRef}>
      <Text
        ref={textRef}
        fontSize={0.22}
        font="/fonts/PressStart2P-Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial
          color="#FF6B6B"
          emissive="#FF6B6B"
          emissiveIntensity={0.35}
          roughness={0.3}
        />
      </Text>
    </group>
  );
}

// Scene
function PolaroidScene({ tool, index, hovered }: { tool: Tool; index: number; hovered: boolean }) {
  return (
    <group>
      <PolaroidFrame index={index} hovered={hovered} />
      <CenterText text={tool.name} index={index} hovered={hovered} />
    </group>
  );
}

export function PixelPolaroid3D({ tool, index }: PixelPolaroid3DProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={tool.path}
      className="block cursor-pointer"
      style={{ width: 260, height: 340, overflow: 'visible' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0.8, 0.5, 3.2], fov: 50 }}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, 3]} intensity={0.6} color="#4ECDC4" />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#FF6B6B" />

        <PolaroidScene tool={tool} index={index} hovered={hovered} />
      </Canvas>

      <div className="text-center -mt-2">
        <p className="text-sm text-white/60 font-medium">{tool.subtitle}</p>
      </div>
    </Link>
  );
}
