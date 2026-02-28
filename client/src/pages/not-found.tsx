import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F0EB]">
      <SEOHead title="Page Not Found" noIndex />
      <div className="text-center px-6">
        <p className="text-7xl font-bold text-primary mb-4" data-testid="text-404">404</p>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-3" data-testid="text-not-found-title">Page Not Found</h1>
        <p className="text-muted-foreground mb-8" data-testid="text-not-found-message">
          This page doesn't exist. Let's get you back on track.
        </p>
        <Link href="/">
          <Button className="gap-2" data-testid="button-go-home">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
