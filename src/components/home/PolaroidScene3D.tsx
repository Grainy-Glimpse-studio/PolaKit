import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

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

// Single pixel block
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
      <boxGeometry args={[0.21, 0.21, 0.16]} />
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

  // Larger frame
  const pixelSize = 0.24;
  const cols = 12;
  const rows = 15;

  const pixels = useMemo(() => {
    const result: { pos: [number, number, number]; colorIndex: number }[] = [];

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

    // Reduced rotation for stability
    const rotateX = Math.sin(time * 0.4 + floatOffset) * 0.05;
    const rotateY = Math.cos(time * 0.35 + floatOffset) * 0.06;

    // Hover: move forward
    const targetZ = isHovered ? 0.6 : 0;
    const currentZ = groupRef.current.position.z - basePosition[2];
    const newZ = basePosition[2] + currentZ + (targetZ - currentZ) * 0.1;

    groupRef.current.position.set(
      basePosition[0] + floatX,
      basePosition[1] + floatY,
      newZ
    );
    groupRef.current.rotation.set(rotateX, rotateY, 0);
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
        yOffset={0.35}
        xOffset={index === 1 ? -0.03 : index === 2 ? -0.09 : 0}
        fontSize={0.24}
        index={index}
        isHovered={isHovered}
      />

      {/* Subtitle - below the name */}
      <NeonText
        text={tool.subtitle}
        yOffset={-0.1}
        xOffset={index === 1 ? -0.03 : index === 2 ? -0.09 : 0}
        fontSize={0.11}
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

  const positions: [number, number, number][] = [
    [-3.5, 0, 0],
    [0, 0, 0],
    [3.5, 0, 0],
  ];

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, 3]} intensity={0.6} color="#4ECDC4" />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#FF6B6B" />

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
    </>
  );
}

interface PolaroidScene3DProps {
  tools: Tool[];
}

export function PolaroidScene3D({ tools }: PolaroidScene3DProps) {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas
        camera={{ position: [0, 0.2, 6.5], fov: 50 }}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      >
        <Scene tools={tools} />
      </Canvas>
    </div>
  );
}
