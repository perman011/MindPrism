import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Headphones, Sparkles, Zap, Target } from "lucide-react";
const heroBg = "/images/hero-bg.png";

const features = [
  {
    icon: Brain,
    title: "Core Principles",
    description: "Every 500-page book distilled into its most powerful psychological principles. No fluff, just the insights that change lives.",
    gradient: "from-purple-500/10 to-purple-600/5",
  },
  {
    icon: Sparkles,
    title: "Interactive Exercises",
    description: "Reflection prompts, knowledge checks, and action plans that help you apply what you learn immediately to your daily life.",
    gradient: "from-amber-500/10 to-amber-600/5",
  },
  {
    icon: Headphones,
    title: "Audio Summaries",
    description: "Professionally crafted audio summaries you can listen to during commutes, workouts, or whenever you have a spare moment.",
    gradient: "from-rose-500/10 to-rose-600/5",
  },
  {
    icon: Zap,
    title: "Bite-Sized Stories",
    description: "Real-world case studies and anecdotes extracted from the books that bring abstract psychology concepts to life.",
    gradient: "from-teal-500/10 to-teal-600/5",
  },
  {
    icon: Target,
    title: "Track Your Growth",
    description: "Personal growth vault where you track progress, save journal entries, and build your psychological toolkit over time.",
    gradient: "from-indigo-500/10 to-indigo-600/5",
  },
  {
    icon: BookOpen,
    title: "Curated Library",
    description: "Hand-picked psychology and self-help classics, each broken down by experts into principles, stories, and actionable exercises.",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold" data-testid="text-logo">MindSpark</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors" data-testid="link-features">Features</a>
            <a href="#how-it-works" className="transition-colors" data-testid="link-how-it-works">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/login">
              <Button variant="ghost" size="sm" data-testid="button-login">Log In</Button>
            </a>
            <a href="/api/login">
              <Button size="sm" data-testid="button-get-started">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-20 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8" data-testid="badge-tagline">
              <Sparkles className="w-3.5 h-3.5" />
              Psychology made simple
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6" data-testid="text-hero-title">
              Stop reading 500-page books.{" "}
              <span className="text-primary">Start transforming</span> your life.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-description">
              We extract the most powerful principles, stories, and exercises from the world's best psychology books and deliver them in interactive, bite-sized experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a href="/api/login">
                <Button size="lg" className="text-base px-8 gap-2" data-testid="button-hero-cta">
                  <Zap className="w-4 h-4" />
                  Start Learning Free
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-base px-8" data-testid="button-hero-secondary">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground" data-testid="text-trust-badges">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                Free to start
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" />
                Interactive exercises
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-primary" />
                Audio summaries
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything you need to grow
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each book is broken down into multiple interactive formats so you can learn the way that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-6 hover-elevate cursor-default"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              How MindSpark works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to transform dense psychology books into actionable personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse the Library", description: "Explore our curated collection of psychology and self-help books, organized by topic and goal." },
              { step: "02", title: "Learn Interactively", description: "Read key principles, explore real stories, listen to audio summaries, and complete hands-on exercises." },
              { step: "03", title: "Apply & Grow", description: "Track your progress, build your personal growth journal, and watch your understanding deepen over time." },
            ].map((item) => (
              <div key={item.step} className="text-center" data-testid={`step-${item.step}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-serif text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of learners who are transforming dense psychology books into daily personal growth.
          </p>
          <a href="/api/login">
            <Button size="lg" className="text-base px-8 gap-2" data-testid="button-cta-bottom">
              <Zap className="w-4 h-4" />
              Get Started Free
            </Button>
          </a>
        </div>
      </section>

      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-serif font-semibold text-foreground">MindSpark</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MindSpark. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
