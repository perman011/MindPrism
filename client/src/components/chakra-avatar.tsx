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
  crown: { cx: 200, cy: 62 },
  third_eye: { cx: 200, cy: 88 },
  throat: { cx: 200, cy: 128 },
  heart: { cx: 200, cy: 168 },
  solar_plexus: { cx: 200, cy: 205 },
  sacral: { cx: 200, cy: 240 },
  root: { cx: 200, cy: 275 },
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

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: containerSize, height: containerSize * 1.05 }}
      data-testid="chakra-avatar"
    >
      <svg
        viewBox="0 0 400 360"
        width={containerSize}
        height={containerSize * 0.9}
        className="drop-shadow-2xl"
      >
        <defs>
          {chakraOrder.map(chakra => {
            const info = CHAKRA_MAP[chakra];
            return (
              <radialGradient key={`glow-${chakra}`} id={`glow-${chakra}`}>
                <stop offset="0%" stopColor={info.color} stopOpacity="1" />
                <stop offset="35%" stopColor={info.color} stopOpacity="0.5" />
                <stop offset="70%" stopColor={info.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={info.color} stopOpacity="0" />
              </radialGradient>
            );
          })}

          <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="bodyStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
          </linearGradient>

          <radialGradient id="auraGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#6d28d9" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="spineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <ellipse cx="200" cy="200" rx="160" ry="160" fill="url(#auraGlow)" />

        <g opacity={activeChakra ? 0.5 : 0.85} className="transition-opacity duration-500" filter="url(#softGlow)">

          <circle cx="200" cy="68" r="28" fill="url(#bodyGradient)" stroke="url(#bodyStroke)" strokeWidth="1.2" />

          <ellipse cx="200" cy="53" rx="5" ry="3" fill="rgba(196,181,253,0.15)" />

          <path
            d="M188,96 C184,96 176,100 172,108 L172,108
               C168,116 166,128 166,140
               L166,140 C166,148 168,152 170,156
               L234,156 C236,152 238,148 238,140
               L238,140 C238,128 236,116 232,108
               C228,100 220,96 216,96
               Z"
            fill="url(#bodyGradient)"
            stroke="url(#bodyStroke)"
            strokeWidth="1"
          />

          <path
            d="M172,120 C168,122 158,126 148,132
               C138,138 128,148 118,162
               C112,172 108,178 108,182
               C108,186 112,188 116,186
               C120,184 128,178 136,172
               L148,164 L152,168"
            fill="none"
            stroke="url(#bodyStroke)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M172,120 C168,122 158,126 148,132
               C138,138 128,148 118,162
               C112,172 108,178 108,182
               C108,186 112,188 116,186
               C120,184 128,178 136,172
               L148,164 L152,168"
            fill="none"
            stroke="url(#bodyGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          <path
            d="M232,120 C236,122 246,126 256,132
               C266,138 276,148 286,162
               C292,172 296,178 296,182
               C296,186 292,188 288,186
               C284,184 276,178 268,172
               L256,164 L252,168"
            fill="none"
            stroke="url(#bodyStroke)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M232,120 C236,122 246,126 256,132
               C266,138 276,148 286,162
               C292,172 296,178 296,182
               C296,186 292,188 288,186
               C284,184 276,178 268,172
               L256,164 L252,168"
            fill="none"
            stroke="url(#bodyGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          <ellipse cx="116" cy="184" rx="8" ry="6" fill="url(#bodyGradient)" stroke="url(#bodyStroke)" strokeWidth="0.8" transform="rotate(-20, 116, 184)" />
          <ellipse cx="288" cy="184" rx="8" ry="6" fill="url(#bodyGradient)" stroke="url(#bodyStroke)" strokeWidth="0.8" transform="rotate(20, 288, 184)" />

          <path
            d="M170,156 C168,162 166,172 166,180
               C166,192 162,200 155,210
               C148,220 140,228 136,236
               C132,244 132,252 138,258
               C142,262 150,264 160,264
               L200,270"
            fill="none"
            stroke="url(#bodyStroke)"
            strokeWidth="1"
          />
          <path
            d="M170,156 C168,162 166,172 166,180
               C166,192 162,200 155,210
               C148,220 140,228 136,236
               C132,244 132,252 138,258
               C142,262 150,264 160,264
               L200,270"
            fill="url(#bodyGradient)"
            opacity="0.6"
          />

          <path
            d="M234,156 C236,162 238,172 238,180
               C238,192 242,200 249,210
               C256,220 264,228 268,236
               C272,244 272,252 266,258
               C262,262 254,264 244,264
               L200,270"
            fill="none"
            stroke="url(#bodyStroke)"
            strokeWidth="1"
          />
          <path
            d="M234,156 C236,162 238,172 238,180
               C238,192 242,200 249,210
               C256,220 264,228 268,236
               C272,244 272,252 266,258
               C262,262 254,264 244,264
               L200,270"
            fill="url(#bodyGradient)"
            opacity="0.6"
          />

          <ellipse cx="148" cy="262" rx="18" ry="8" fill="url(#bodyGradient)" stroke="url(#bodyStroke)" strokeWidth="0.8" transform="rotate(5, 148, 262)" />
          <ellipse cx="256" cy="262" rx="18" ry="8" fill="url(#bodyGradient)" stroke="url(#bodyStroke)" strokeWidth="0.8" transform="rotate(-5, 256, 262)" />

          <path
            d="M155,268 C155,272 160,282 170,288
               C180,294 192,296 200,296
               C208,296 220,294 230,288
               C240,282 248,272 248,268"
            fill="url(#bodyGradient)"
            stroke="url(#bodyStroke)"
            strokeWidth="0.8"
            opacity="0.5"
          />
        </g>

        <line
          x1="200" y1="68" x2="200" y2="280"
          stroke="url(#spineGlow)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={activeChakra ? 0.3 : 0.5}
          className="transition-opacity duration-500"
        />

        {chakraOrder.map((chakra, index) => {
          const pos = chakraPositions[chakra];
          const info = CHAKRA_MAP[chakra];
          const isActive = activeChakra === chakra;
          const isHovered = hoveredChakra === chakra;
          const intensity = getChakraIntensity(chakra, progress);
          const dimmed = activeChakra && !isActive;

          const baseR = isActive ? 12 : isHovered ? 10 : 8;
          const glowR = isActive ? 30 : isHovered ? 24 : 18;
          const outerGlowR = isActive ? 44 : 0;

          return (
            <g
              key={chakra}
              className="cursor-pointer"
              onClick={() => onChakraSelect(isActive ? null : chakra)}
              onMouseEnter={() => setHoveredChakra(chakra)}
              onMouseLeave={() => setHoveredChakra(null)}
              data-testid={`chakra-node-${chakra}`}
            >
              {isActive && (
                <>
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={outerGlowR}
                    fill={`url(#glow-${chakra})`}
                    opacity="0.3"
                  >
                    <animate attributeName="r" values={`${outerGlowR - 6};${outerGlowR + 6};${outerGlowR - 6}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.15;0.3" dur="3s" repeatCount="indefinite" />
                  </circle>

                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={baseR + 16}
                    fill="none"
                    stroke={info.color}
                    strokeWidth="0.5"
                    opacity="0.4"
                  >
                    <animate attributeName="r" values={`${baseR + 14};${baseR + 20};${baseR + 14}`} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={glowR}
                fill={`url(#glow-${chakra})`}
                opacity={dimmed ? 0.1 : intensity * 0.8}
                className="transition-all duration-300"
              />

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR + 2}
                fill={info.color}
                opacity={dimmed ? 0.12 : isActive ? 0.35 : 0.2}
                filter="url(#softGlow)"
                className="transition-all duration-300"
              />

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR}
                fill={info.color}
                opacity={dimmed ? 0.2 : isActive ? 1 : 0.65 + intensity * 0.35}
                className="transition-all duration-300"
              />

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR * 0.55}
                fill="white"
                opacity={dimmed ? 0.05 : isActive ? 0.7 : 0.2}
                className="transition-all duration-300"
              />

              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={baseR * 0.2}
                fill="white"
                opacity={dimmed ? 0.02 : isActive ? 0.9 : 0.35}
                className="transition-all duration-300"
              />

              {!dimmed && (
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={baseR}
                  fill={info.color}
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values={`${baseR};${baseR + 4};${baseR}`}
                    dur="4s"
                    repeatCount="indefinite"
                    begin={`${index * 0.3}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.15;0"
                    dur="4s"
                    repeatCount="indefinite"
                    begin={`${index * 0.3}s`}
                  />
                </circle>
              )}
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
