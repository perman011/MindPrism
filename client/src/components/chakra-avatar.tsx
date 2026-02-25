import { useState } from "react";
import { CHAKRA_MAP, type ChakraType, type ChakraProgress } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface ChakraAvatarProps {
  activeChakra: ChakraType | null;
  onChakraSelect: (chakra: ChakraType | null) => void;
  progress?: ChakraProgress[];
  size?: "sm" | "md" | "lg";
}

const chakraPositions: Record<ChakraType, { top: string; left: string }> = {
  crown:        { top: "6%",  left: "50%" },
  third_eye:    { top: "14%", left: "50%" },
  throat:       { top: "25%", left: "50%" },
  heart:        { top: "36%", left: "50%" },
  solar_plexus: { top: "47%", left: "50%" },
  sacral:       { top: "57%", left: "50%" },
  root:         { top: "67%", left: "50%" },
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
  const containerWidth = sizeMap[size];
  const containerHeight = containerWidth * 1.33;

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
          src="/images/chakra-meditating-figure.png"
          alt="Meditating figure with chakra points"
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {chakraOrder.map((chakra, index) => {
          const pos = chakraPositions[chakra];
          const info = CHAKRA_MAP[chakra];
          const isActive = activeChakra === chakra;
          const isHovered = hoveredChakra === chakra;
          const dimmed = activeChakra && !isActive;
          const hitSize = size === "sm" ? 28 : size === "md" ? 36 : 44;

          return (
            <div
              key={chakra}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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
                  className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: hitSize * 2,
                    height: hitSize * 2,
                    backgroundColor: info.color,
                    opacity: 0.15,
                    animationDuration: "2s",
                  }}
                />
              )}

              <div
                className="absolute rounded-full transition-all duration-300"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: isActive ? hitSize * 1.8 : isHovered ? hitSize * 1.4 : hitSize * 0.9,
                  height: isActive ? hitSize * 1.8 : isHovered ? hitSize * 1.4 : hitSize * 0.9,
                  background: `radial-gradient(circle, ${info.color}40 0%, ${info.color}15 50%, transparent 70%)`,
                  opacity: dimmed ? 0.1 : 1,
                }}
              />

              {(isActive || isHovered) && !dimmed && (
                <div
                  className="absolute rounded-full border transition-all duration-300"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: isActive ? hitSize * 1.5 : hitSize * 1.2,
                    height: isActive ? hitSize * 1.5 : hitSize * 1.2,
                    borderColor: `${info.color}60`,
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
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
          >
            {(() => {
              const c = activeChakra || hoveredChakra;
              if (!c) return null;
              const info = CHAKRA_MAP[c];
              return (
                <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
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
