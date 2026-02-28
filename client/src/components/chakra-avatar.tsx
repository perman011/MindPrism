import { useState } from "react";
import { CHAKRA_MAP, type ChakraType, type ChakraProgress } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import chakraFigureImg from "@assets/19BCBEB7-13F0-4DEA-8D60-2FD625CD7BF2_1772158928986.png";

interface ChakraAvatarProps {
  activeChakra: ChakraType | null;
  onChakraSelect: (chakra: ChakraType | null) => void;
  progress?: ChakraProgress[];
  size?: "sm" | "md" | "lg";
}

const chakraPositions: Record<ChakraType, { top: string; left: string }> = {
  crown:        { top: "15%",   left: "50%" },
  third_eye:    { top: "24%",   left: "50%" },
  throat:       { top: "35.3%", left: "50%" },
  heart:        { top: "43.5%", left: "50%" },
  solar_plexus: { top: "51.5%", left: "50%" },
  sacral:       { top: "59.5%", left: "50%" },
  root:         { top: "67%",   left: "50%" },
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

  const sizeMap = { sm: 240, md: 320, lg: 400 };
  const containerWidth = sizeMap[size];
  const containerHeight = containerWidth;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: containerWidth, height: containerHeight }}
      data-testid="chakra-avatar"
    >
      <div
        className="relative w-full h-full"
        style={{
          opacity: activeChakra ? 0.85 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <img
          src={chakraFigureImg}
          alt="Meditating figure with chakra points"
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {chakraOrder.map((chakra) => {
          const pos = chakraPositions[chakra];
          const info = CHAKRA_MAP[chakra];
          const isActive = activeChakra === chakra;
          const isHovered = hoveredChakra === chakra;
          const dimmed = activeChakra && !isActive;
          const dotSize = size === "sm" ? 14 : size === "md" ? 18 : 22;
          const hitSize = size === "sm" ? 40 : size === "md" ? 48 : 56;

          return (
            <div
              key={chakra}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
              style={{
                top: pos.top,
                left: pos.left,
                width: hitSize,
                height: hitSize,
                zIndex: isActive ? 20 : 10,
              }}
              onClick={() => onChakraSelect(isActive ? null : chakra)}
              onMouseEnter={() => setHoveredChakra(chakra)}
              onMouseLeave={() => setHoveredChakra(null)}
              data-testid={`chakra-node-${chakra}`}
            >
              {isActive && (
                <div
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: dotSize * 2.5,
                    height: dotSize * 2.5,
                    backgroundColor: info.color,
                    opacity: 0.2,
                    animationDuration: "2s",
                  }}
                />
              )}

              <div
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isActive ? dotSize * 2.2 : isHovered ? dotSize * 1.8 : dotSize * 1.5,
                  height: isActive ? dotSize * 2.2 : isHovered ? dotSize * 1.8 : dotSize * 1.5,
                  background: `radial-gradient(circle, ${info.color}50 0%, ${info.color}20 60%, transparent 80%)`,
                  opacity: dimmed ? 0.15 : 1,
                }}
              />

              <div
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isActive ? dotSize * 1.4 : isHovered ? dotSize * 1.2 : dotSize,
                  height: isActive ? dotSize * 1.4 : isHovered ? dotSize * 1.2 : dotSize,
                  backgroundColor: info.color,
                  opacity: dimmed ? 0.2 : 0.9,
                  boxShadow: dimmed ? 'none' : `0 0 ${dotSize * 0.6}px ${info.color}80, 0 0 ${dotSize * 1.2}px ${info.color}40`,
                }}
              />

              {(isActive || isHovered) && !dimmed && (
                <div
                  className="absolute rounded-full border-2 transition-all duration-300"
                  style={{
                    width: isActive ? dotSize * 2 : dotSize * 1.6,
                    height: isActive ? dotSize * 2 : dotSize * 1.6,
                    borderColor: `${info.color}80`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {(activeChakra || hoveredChakra) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
          >
            {(() => {
              const c = activeChakra || hoveredChakra;
              if (!c) return null;
              const info = CHAKRA_MAP[c];
              return (
                <div className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium" style={{ color: info.color }}>
                    {info.name} Chakra
                  </span>
                  <span className="text-[10px] text-white/50 ml-1.5">
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
