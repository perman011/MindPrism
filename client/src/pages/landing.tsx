import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";
import { useState, useEffect, useCallback } from "react";
const heroBg = "/images/hero-bg.png";

const slides = [
  {
    title: "Skip the 500 pages.",
    highlight: "Master the principles.",
    description: "Every dense psychology book distilled into its most powerful ideas — visual, interactive, and unforgettable.",
    gradient: "from-black via-yellow-950 to-black",
  },
  {
    title: "Visuals, Exercises &",
    highlight: "Audio Summaries.",
    description: "For the busy mind. Learn through interactive cards, reflection exercises, and listen on the go.",
    gradient: "from-black via-amber-950 to-black",
  },
  {
    title: "Track your growth.",
    highlight: "Build your mind.",
    description: "Personal journal, streak tracking, and a vault of saved insights. Your psychology toolkit, always with you.",
    gradient: "from-black via-yellow-900 to-black",
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
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
      </div>

      <nav className="relative z-10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center mix-blend-screen" data-testid="text-logo">
          <img src={mindprismLogo} alt="MindPrism" className="h-16 object-contain" style={{ aspectRatio: '1.618' }} />
        </div>
        <a href="/api/login">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" data-testid="button-login">
            I already have an account
          </Button>
        </a>
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
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    {slide.highlight}
                  </span>
                </h1>
                <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-8 mb-10">
            <button
              onClick={() => handleManualNav("prev")}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
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
                    i === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/30"
                  }`}
                  data-testid={`dot-${i}`}
                />
              ))}
            </div>
            <button
              onClick={() => handleManualNav("next")}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="button-carousel-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-10 flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <a href="/api/login" className="w-full">
          <Button
            size="lg"
            className="w-full rounded-full text-base font-semibold h-14 bg-primary hover:bg-primary/90"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </a>
        <a href="/api/login" className="w-full">
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-full text-base font-medium h-14 text-white/60 hover:text-white hover:bg-white/10"
            data-testid="button-hero-cta"
          >
            I already have an account
          </Button>
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}
