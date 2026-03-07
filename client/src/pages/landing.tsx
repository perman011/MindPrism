import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
const heroBg = "/images/hero-bg.png";

function FeatherRain() {
  const feathers = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      left: `${8 + (i * 13) + Math.random() * 8}%`,
      size: 28 + Math.random() * 18,
      delay: -(Math.random() * 20),
      duration: 14 + Math.random() * 10,
      swayAmount: 40 + Math.random() * 60,
      swayDuration: 4 + Math.random() * 3,
      startRotate: -25 + Math.random() * 50,
      opacity: 0.12 + Math.random() * 0.10,
    })),
  []);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {feathers.map((f) => (
        <div
          key={f.id}
          className="absolute top-0 feather-fall"
          style={{
            left: f.left,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <div
            className="feather-sway"
            style={{
              animationDuration: `${f.swayDuration}s`,
              animationDelay: `${f.delay}s`,
              // @ts-ignore
              '--sway': `${f.swayAmount}px`,
            }}
          >
            <img
              src={mindprismLogo}
              alt=""
              className="select-none feather-spin"
              style={{
                width: f.size,
                height: f.size,
                opacity: f.opacity,
                filter: 'drop-shadow(0 2px 8px rgba(212,170,50,0.25))',
                animationDuration: `${f.duration * 0.8}s`,
                animationDelay: `${f.delay}s`,
                // @ts-ignore
                '--spin-from': `${f.startRotate}deg`,
                '--spin-to': `${-f.startRotate}deg`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const slides = [
  {
    title: "Every book. Key principles.",
    highlight: "In minutes.",
    description: "Chapter-by-chapter summaries, mental models, and the core principles — distilled from the world's best books.",
  },
  {
    title: "Shorts for every story.",
    highlight: "Read, listen, watch.",
    description: "Bite-sized video Shorts, audio walkthroughs, and reading cards for every book. Learn however suits you.",
  },
  {
    title: "Track your growth.",
    highlight: "Build your mind.",
    description: "Personal journal, streak tracking, and a vault of saved insights — your all-in-one reading companion.",
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleManualNav = (direction: "next" | "prev") => {
    setIsAutoPlaying(false);
    if (direction === "next") nextSlide();
    else prevSlide();
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <SEOHead
        title="Welcome"
        description="Every book distilled into key principles, mental models, chapter summaries, audio walkthroughs, and Shorts. Business, science, philosophy, leadership and beyond."
        ogImage="/images/mindprism-logo.jpeg"
      />
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-5 dark:opacity-[0.03]" />
        <div className="absolute inset-0 landing-hero-gradient" />
      </div>

      <FeatherRain />

      <nav className="relative z-10 px-6 py-5 flex items-center justify-between gap-2 flex-wrap">
        <motion.div
          className="flex items-center"
          data-testid="text-logo"
          initial={{ y: -80, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            duration: 1.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            y: { duration: 1.8, ease: [0.22, 0.68, 0.36, 1] },
            rotate: { duration: 2.2, ease: "easeOut" },
            opacity: { duration: 1.2 },
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <img src={mindprismLogo} alt="MindPrism" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,210,80,0.3)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-[#2D1B45] via-[#5B2C6F] to-[#8E44AD] bg-clip-text text-transparent dark:from-[#D4B8D6] dark:via-[#E8D5EA] dark:to-[#F0E6F3]">MindPrism</span>
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#8E44AD]/60 dark:text-[#D4B8D6]/50 -mt-0.5">Big Ideas, Made Simple</span>
            </div>
          </div>
        </motion.div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="relative min-h-[240px] sm:min-h-[200px] flex items-center justify-center">
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                  i === currentSlide
                    ? "opacity-100 translate-x-0"
                    : i < currentSlide
                      ? "opacity-0 -translate-x-12"
                      : "opacity-0 translate-x-12"
                }`}
                data-testid={`slide-${i}`}
              >
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  {slide.title}{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-lighter bg-clip-text text-transparent">
                    {slide.highlight}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-8 mb-10">
            <button
              onClick={() => handleManualNav("prev")}
              className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
              data-testid="button-carousel-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentSlide(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide ? "w-8 bg-primary" : "w-2 bg-foreground/20"
                  }`}
                  data-testid={`dot-${i}`}
                />
              ))}
            </div>
            <button
              onClick={() => handleManualNav("next")}
              className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
              data-testid="button-carousel-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-10 flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <Button
          size="lg"
          className="w-full rounded-full text-base font-semibold"
          onClick={() => { window.location.href = "/api/login"; }}
          data-testid="button-get-started"
        >
          Get Started
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full rounded-full text-base font-medium text-muted-foreground"
          onClick={() => { window.location.href = "/api/login"; }}
          data-testid="button-hero-cta"
        >
          I already have an account
        </Button>
      </div>

      <div className="relative z-10 py-4 text-center">
        <a
          href="/privacy"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Privacy Policy
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}
