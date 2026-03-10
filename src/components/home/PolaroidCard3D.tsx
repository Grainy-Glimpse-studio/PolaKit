import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  path: string;
}

interface PolaroidCard3DProps {
  tool: Tool;
  index: number;
  style?: {
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    translateZ?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

// Custom icons
function CropperIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="15"
        y="15"
        width="50"
        height="50"
        rx="2"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="8 4"
      />
      <path
        d="M10 30V10H30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M70 50V70H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="40" cy="40" r="4" fill="currentColor" />
    </svg>
  );
}

function GaussianIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="20"
        y="25"
        width="40"
        height="35"
        rx="2"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="25"
        y="30"
        width="30"
        height="25"
        rx="1"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <circle cx="40" cy="42" r="8" stroke="currentColor" strokeWidth="2.5" />
      <ellipse
        cx="40"
        cy="42"
        rx="20"
        ry="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      <ellipse
        cx="40"
        cy="42"
        rx="28"
        ry="24"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.3"
      />
      <line
        x1="20"
        y1="60"
        x2="20"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="10"
        width="25"
        height="30"
        rx="1"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="45"
        y="10"
        width="25"
        height="30"
        rx="1"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="10"
        y="45"
        width="25"
        height="30"
        rx="1"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        x="45"
        y="45"
        width="25"
        height="30"
        rx="1"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <line
        x1="40"
        y1="5"
        x2="40"
        y2="80"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <line
        x1="5"
        y1="42"
        x2="75"
        y2="42"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.4"
      />
    </svg>
  );
}

const TOOL_GRADIENTS: Record<string, string> = {
  cropper: 'from-rose-500 via-orange-400 to-amber-400',
  gaussian: 'from-violet-500 via-purple-400 to-fuchsia-400',
  print: 'from-cyan-400 via-blue-400 to-indigo-500',
};

export function PolaroidCard3D({ tool, index, style = {} }: PolaroidCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    rotateX = 5,
    rotateY = -5,
    rotateZ = 0,
    translateZ = 0,
    offsetX = 0,
    offsetY = 0,
  } = style;

  // Animation delay based on index
  const animationDelay = `${index * 0.3}s`;

  return (
    <Link
      to={tool.path}
      className="block relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="polaroid-card-3d relative transition-all duration-500 ease-out"
        style={{
          transform: `
            translateX(${offsetX}px)
            translateY(${offsetY}px)
            translateZ(${translateZ}px)
            rotateX(${isHovered ? 0 : rotateX}deg)
            rotateY(${isHovered ? 0 : rotateY}deg)
            rotateZ(${isHovered ? 0 : rotateZ}deg)
            ${isHovered ? 'scale(1.08)' : 'scale(1)'}
          `,
          transformStyle: 'preserve-3d',
          animation: `float3d 6s ease-in-out infinite`,
          animationDelay,
          boxShadow: isHovered
            ? `
              0 0 20px rgba(255, 107, 107, 0.4),
              0 0 40px rgba(78, 205, 196, 0.3),
              0 0 60px rgba(69, 183, 209, 0.2),
              0 25px 50px -12px rgba(0, 0, 0, 0.5)
            `
            : `
              0 0 10px rgba(255, 107, 107, 0.2),
              0 0 20px rgba(78, 205, 196, 0.15),
              0 0 30px rgba(69, 183, 209, 0.1),
              0 15px 35px -10px rgba(0, 0, 0, 0.4)
            `,
        }}
      >
        {/* Card body */}
        <div className="bg-white/95 backdrop-blur-sm rounded-sm p-3 pb-12">
          {/* Image area with gradient */}
          <div
            className={`aspect-square rounded-sm bg-gradient-to-br ${TOOL_GRADIENTS[tool.id]} relative overflow-hidden`}
          >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-30">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)
                  `,
                }}
              />
            </div>

            {/* Tool icon */}
            <div className="absolute inset-0 flex items-center justify-center text-white/90">
              <div
                className="transition-transform duration-300"
                style={{ transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}
              >
                {tool.id === 'cropper' && <CropperIcon />}
                {tool.id === 'gaussian' && <GaussianIcon />}
                {tool.id === 'print' && <PrintIcon />}
              </div>
            </div>

            {/* Shine effect on hover */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transition-opacity duration-300 pointer-events-none"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: 'translateX(-100%) rotate(45deg)',
                animation: isHovered ? 'shine 0.6s ease-out forwards' : 'none',
              }}
            />
          </div>

          {/* Pixel text label area */}
          <div className="pt-4 px-1 text-center">
            <h3
              className="pixel-text text-sm font-bold uppercase tracking-wider"
              style={{
                animationDelay: `${index * 0.5}s`,
              }}
            >
              {tool.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {tool.subtitle}
            </p>
          </div>
        </div>

        {/* Glow border effect */}
        <div
          className="absolute inset-0 rounded-sm pointer-events-none transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg,
              rgba(255, 107, 107, 0.3),
              rgba(255, 230, 109, 0.3),
              rgba(78, 205, 196, 0.3),
              rgba(69, 183, 209, 0.3)
            )`,
            opacity: isHovered ? 0.6 : 0.2,
            filter: 'blur(1px)',
            transform: 'scale(1.02)',
            zIndex: -1,
          }}
        />
      </div>
    </Link>
  );
}
