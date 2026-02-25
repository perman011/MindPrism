import { motion, AnimatePresence } from "framer-motion";
import { CHAKRA_MAP, type ChakraType } from "@shared/schema";
import { useState, useEffect } from "react";

interface ChakraEnergyBurstProps {
  chakra: ChakraType | null;
  show: boolean;
  onComplete?: () => void;
  points?: number;
}

function EnergyRing({ color, delay, size }: { color: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
      }}
      initial={{ scale: 0, opacity: 0.9 }}
      animate={{ scale: 3.5, opacity: 0 }}
      transition={{ duration: 1.4, delay, ease: "easeOut" }}
    />
  );
}

function EnergyParticle({ color, angle, delay }: { color: string; angle: number; delay: number }) {
  const rad = (angle * Math.PI) / 180;
  const distance = 250 + Math.random() * 150;
  const size = 3 + Math.random() * 6;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: "50%",
        left: "50%",
        boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}40`,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        opacity: 0,
        scale: 0.2,
      }}
      transition={{ duration: 1.2 + Math.random() * 0.6, delay, ease: "easeOut" }}
    />
  );
}

export function ChakraEnergyBurst({ chakra, show, onComplete, points = 10 }: ChakraEnergyBurstProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && chakra) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [show, chakra]);

  if (!chakra) return null;

  const info = CHAKRA_MAP[chakra];
  const color = info.color;

  const particles = Array.from({ length: 36 }, (_, i) => ({
    angle: i * 10 + Math.random() * 8,
    delay: Math.random() * 0.3,
  }));

  const rings = [
    { delay: 0, size: 60 },
    { delay: 0.15, size: 80 },
    { delay: 0.3, size: 50 },
    { delay: 0.45, size: 100 },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="chakra-energy-burst"
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="absolute rounded-full"
            style={{
              width: 120,
              height: 120,
              background: `radial-gradient(circle, ${color}60 0%, ${color}20 50%, transparent 70%)`,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              boxShadow: `0 0 60px ${color}40, 0 0 120px ${color}20`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {rings.map((ring, i) => (
            <EnergyRing key={i} color={color} delay={ring.delay} size={ring.size} />
          ))}

          {particles.map((p, i) => (
            <EnergyParticle key={i} color={color} angle={p.angle} delay={p.delay} />
          ))}

          <motion.div
            className="absolute flex flex-col items-center gap-1"
            style={{ top: "40%" }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
          >
            <motion.span
              className="text-3xl font-bold font-serif"
              style={{ color, textShadow: `0 0 20px ${color}80` }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              +{points} Points
            </motion.span>
            <motion.span
              className="text-sm font-medium text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {info.name} Chakra Powered Up
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
