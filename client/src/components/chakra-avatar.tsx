import { useState, useEffect, useRef } from "react";
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
  crown:        { top: "13.9%", left: "50%" },
  third_eye:    { top: "22.2%", left: "50%" },
  throat:       { top: "33.5%", left: "50%" },
  heart:        { top: "43.1%", left: "50%" },
  solar_plexus: { top: "51.5%", left: "50%" },
  sacral:       { top: "59.5%", left: "50%" },
  root:         { top: "67.1%", left: "50%" },
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

function useTransparentImage(src: string): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const threshold = 35;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = Math.max(r, g, b);
        if (brightness < threshold) {
          data[i + 3] = 0;
        } else if (brightness < threshold + 30) {
          data[i + 3] = Math.round((data[i + 3] * (brightness - threshold)) / 30);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);

  return dataUrl;
}

/** Small inline keyframe style injected once */
const BREATHE_STYLE = `
@keyframes chakra-breathe {
  0%   { transform: translate(-50%, -50%) scale(1); }
  40%  { transform: translate(-50%, -50%) scale(1.35); }
  70%  { transform: translate(-50%, -50%) scale(0.9); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
`;

export function ChakraAvatar({ activeChakra, onChakraSelect, progress, size = "md" }: ChakraAvatarProps) {
  const [hoveredChakra, setHoveredChakra] = useState<ChakraType | null>(null);
  const [breatheDone, setBreatheDone] = useState(false);
  const transparentSrc = useTransparentImage(chakraFigureImg);

  // Inject keyframe style once
  useEffect(() => {
    const id = "chakra-breathe-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = BREATHE_STYLE;
      document.head.appendChild(style);
    }
    // Mark breathe as done after one cycle (0.9s per dot, last dot at index 6 → 6 * 120ms stagger + 900ms)
    const timer = setTimeout(() => setBreatheDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

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
        {transparentSrc ? (
          <img
            src={transparentSrc}
            alt="Meditating figure with chakra points"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full" />
        )}

        {chakraOrder.map((chakra, index) => {
          const pos = chakraPositions[chakra];
          const info = CHAKRA_MAP[chakra];
          const isActive = activeChakra === chakra;
          const isHovered = hoveredChakra === chakra;
          const dimmed = activeChakra && !isActive;

          // Larger dots for better visibility & tap targets
          const dotSize = size === "sm" ? 16 : size === "md" ? 22 : 26;
          // Always at least 36x36 hit target (per spec)
          const hitSize = Math.max(36, size === "sm" ? 44 : size === "md" ? 52 : 60);

          // Breathe animation: stagger each dot by 120ms, run once on mount
          const breatheDelay = `${index * 120}ms`;
          const breatheAnimation = !breatheDone
            ? `chakra-breathe 0.9s ease ${breatheDelay} 1`
            : "none";

          return (
            <div
              key={chakra}
              className="absolute cursor-pointer flex items-center justify-center"
              style={{
                top: pos.top,
                left: pos.left,
                width: hitSize,
                height: hitSize,
                // Use translate to center the hit-box on the position point
                transform: "translate(-50%, -50%)",
                zIndex: isActive ? 20 : 10,
                animation: breatheAnimation,
              }}
              onClick={() => onChakraSelect(isActive ? null : chakra)}
              onMouseEnter={() => setHoveredChakra(chakra)}
              onMouseLeave={() => setHoveredChakra(null)}
              data-testid={`chakra-node-${chakra}`}
              aria-label={`${info.name} Chakra — click to filter`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChakraSelect(isActive ? null : chakra);
                }
              }}
            >
              {/* Ping ring when active */}
              {isActive && (
                <div
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: dotSize * 2.8,
                    height: dotSize * 2.8,
                    backgroundColor: info.color,
                    opacity: 0.25,
                    animationDuration: "1.8s",
                  }}
                />
              )}

              {/* Outer glow halo — larger when active */}
              <div
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isActive ? dotSize * 2.6 : isHovered ? dotSize * 2.0 : dotSize * 1.6,
                  height: isActive ? dotSize * 2.6 : isHovered ? dotSize * 2.0 : dotSize * 1.6,
                  background: `radial-gradient(circle, ${info.color}60 0%, ${info.color}25 55%, transparent 80%)`,
                  opacity: dimmed ? 0.12 : 1,
                  boxShadow: isActive
                    ? `0 0 ${dotSize * 1.5}px ${info.color}90, 0 0 ${dotSize * 2.5}px ${info.color}50`
                    : "none",
                  transition: "all 0.3s ease",
                }}
              />

              {/* Solid core dot */}
              <div
                className="absolute rounded-full transition-all duration-300"
                style={{
                  width: isActive ? dotSize * 1.6 : isHovered ? dotSize * 1.3 : dotSize,
                  height: isActive ? dotSize * 1.6 : isHovered ? dotSize * 1.3 : dotSize,
                  backgroundColor: info.color,
                  opacity: dimmed ? 0.2 : isActive ? 1 : 0.92,
                  boxShadow: dimmed
                    ? "none"
                    : isActive
                    ? `0 0 ${dotSize * 0.9}px ${info.color}, 0 0 ${dotSize * 1.8}px ${info.color}80`
                    : `0 0 ${dotSize * 0.5}px ${info.color}70`,
                }}
              />

              {/* Border ring on hover/active */}
              {(isActive || isHovered) && !dimmed && (
                <div
                  className="absolute rounded-full border-2 transition-all duration-300"
                  style={{
                    width: isActive ? dotSize * 2.2 : dotSize * 1.8,
                    height: isActive ? dotSize * 2.2 : dotSize * 1.8,
                    borderColor: `${info.color}90`,
                  }}
                />
              )}

              {/* Floating label on hover or active */}
              <AnimatePresence>
                {(isActive || isHovered) && !dimmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.85 }}
                    animate={{ opacity: 1, y: -dotSize * 1.8, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.85 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
                    style={{ bottom: "100%", marginBottom: 4 }}
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md"
                      style={{
                        backgroundColor: `${info.color}22`,
                        color: info.color,
                        border: `1px solid ${info.color}60`,
                        backdropFilter: "blur(4px)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {info.name}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom info pill — shows active or hovered chakra details */}
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
                <div
                  className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm border shadow-sm flex items-center gap-1.5"
                  style={{ borderColor: `${info.color}50` }}
                >
                  {/* Color swatch */}
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="text-xs font-semibold" style={{ color: info.color }}>
                    {info.name} Chakra
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {activeChakra ? "· filtering books" : `· ${info.theme}`}
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
