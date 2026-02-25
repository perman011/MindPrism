import { useState } from "react";
import { CHAKRA_MAP, type ChakraType, type ChakraProgress } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface ChakraAvatarProps {
  activeChakra: ChakraType | null;
  onChakraSelect: (chakra: ChakraType | null) => void;
  progress?: ChakraProgress[];
  size?: "sm" | "md" | "lg";
}

const chakraPositions: Record<ChakraType, { cx: number; cy: number }> = {
  crown: { cx: 150, cy: 52 },
  third_eye: { cx: 150, cy: 82 },
  throat: { cx: 150, cy: 118 },
  heart: { cx: 150, cy: 155 },
  solar_plexus: { cx: 150, cy: 190 },
  sacral: { cx: 150, cy: 222 },
  root: { cx: 150, cy: 255 },
};

const chakraOrder: ChakraType[] = [
  "crown", "third_eye", "throat", "heart", "solar_plexus", "sacral", "root"
];

function getChakraIntensity(chakra: ChakraType, progress?: ChakraProgress[]): number {
  if (!progress) return 0.3;
  const entry = progress.find(p => p.chakra === chakra);
  if (!entry || !entry.points) return 0.15;
  const intensity = Math.min(1, (entry.points || 0) / 100);
  return 0.2 + intensity * 0.8;
}

export function ChakraAvatar({ activeChakra, onChakraSelect, progress, size = "md" }: ChakraAvatarProps) {
  const [hoveredChakra, setHoveredChakra] = useState<ChakraType | null>(null);

  const sizeMap = { sm: 200, md: 280, lg: 340 };
  const containerSize = sizeMap[size];
  const scale = containerSize / 300;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: containerSize, height: containerSize * 1.1 }}
      data-testid="chakra-avatar"
    >
      <svg
        viewBox="0 0 300 310"
        width={containerSize}
        height={containerSize * 1.03}
        className="drop-shadow-2xl"
      >
        <defs>
          {chakraOrder.map(chakra => {
            const info = CHAKRA_MAP[chakra];
            return (
              <radialGradient key={`glow-${chakra}`} id={`glow-${chakra}`}>
                <stop offset="0%" stopColor={info.color} stopOpacity="0.9" />
                <stop offset="50%" stopColor={info.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={info.color} stopOpacity="0" />
              </radialGradient>
            );
          })}
          <linearGradient id="bodyGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.03" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g opacity={activeChakra ? 0.5 : 0.9} className="transition-opacity duration-500">
          <path
            d="M150,30 C150,30 130,40 128,55 C126,70 130,80 130,90 
               C125,95 115,100 112,110 C108,125 110,135 112,145 
               C108,150 95,155 92,170 C88,188 100,200 108,208 
               C105,215 100,225 100,238 C100,258 110,270 115,278 
               L115,290 C115,298 125,305 150,305 C175,305 185,298 185,290 
               L185,278 C190,270 200,258 200,238 C200,225 195,215 192,208 
               C200,200 212,188 208,170 C205,155 192,150 188,145 
               C190,135 192,125 188,110 C185,100 175,95 170,90 
               C170,80 174,70 172,55 C170,40 150,30 150,30Z"
            fill="url(#bodyGlow)"
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1"
            filter="url(#softGlow)"
          />

          <line x1="108" y1="142" x2="75" y2="175" stroke="rgba(139,92,246,0.15)" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="175" x2="60" y2="215" stroke="rgba(139,92,246,0.12)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="192" y1="142" x2="225" y2="175" stroke="rgba(139,92,246,0.15)" strokeWidth="3" strokeLinecap="round" />
          <line x1="225" y1="175" x2="240" y2="215" stroke="rgba(139,92,246,0.12)" strokeWidth="2.5" strokeLinecap="round" />

          <line x1="125" y1="280" x2="115" y2="305" stroke="rgba(139,92,246,0.12)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="175" y1="280" x2="185" y2="305" stroke="rgba(139,92,246,0.12)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {chakraOrder.map(chakra => {
          const pos = chakraPositions[chakra];
          const info = CHAKRA_MAP[chakra];
          const isActive = activeChakra === chakra;
          const isHovered = hoveredChakra === chakra;
          const intensity = getChakraIntensity(chakra, progress);
          const baseR = isActive ? 16 : isHovered ? 14 : 11;
          const glowR = isActive ? 28 : isHovered ? 24 : 18;
          const dimmed = activeChakra && !isActive;

          return (
            <g
              key={chakra}
              className="cursor-pointer"
              onClick={() => onChakraSelect(isActive ? null : chakra)}
              onMouseEnter={() => setHoveredChakra(chakra)}
              onMouseLeave={() => setHoveredChakra(null)}
              data-testid={`chakra-node-${chakra}`}
            >
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={glowR}
                fill={`url(#glow-${chakra})`}
                opacity={dimmed ? 0.15 : intensity}
                className="transition-all duration-300"
              />

              {isActive && (
                <>
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={glowR + 8}
                    fill="none"
                    stroke={info.color}
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animate attributeName="r" values={`${glowR + 4};${glowR + 12};${glowR + 4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR}
                fill={info.color}
                opacity={dimmed ? 0.25 : isActive ? 1 : 0.7 + intensity * 0.3}
                className="transition-all duration-300"
              />

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR * 0.5}
                fill="white"
                opacity={dimmed ? 0.1 : isActive ? 0.6 : 0.25}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      <AnimatePresence>
        {(activeChakra || hoveredChakra) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
          >
            {(() => {
              const c = activeChakra || hoveredChakra;
              if (!c) return null;
              const info = CHAKRA_MAP[c];
              return (
                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium" style={{ color: info.color }}>
                    {info.name} Chakra
                  </span>
                  <span className="text-[10px] text-white/60 ml-1.5">
                    {info.theme}
                  </span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
