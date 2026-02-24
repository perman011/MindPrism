import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AudioProvider } from "@/lib/audio-context";
import { BottomNav } from "@/components/bottom-nav";
import { MiniPlayer } from "@/components/mini-player";
import { FullScreenPlayer } from "@/components/full-screen-player";
import LandingPage from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Discover from "@/pages/discover";
import AudioPage from "@/pages/audio";
import Vault from "@/pages/vault";
import BookDetail from "@/pages/book-detail";
import StoryEngine from "@/pages/story-engine";
import NotFound from "@/pages/not-found";
import AdminBooks from "@/pages/admin/admin-books";
import AdminBookEditor from "@/pages/admin/admin-book-editor";
import { getQueryFn } from "@/lib/queryClient";
import type { UserInterest } from "@shared/schema";

function AuthenticatedApp() {
  const { data: interests, isLoading: interestsLoading } = useQuery<UserInterest | null>({
    queryKey: ["/api/interests"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (interestsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!interests || !interests.onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <AudioProvider>
      <div className="pb-16">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/discover" component={Discover} />
          <Route path="/audio" component={AudioPage} />
          <Route path="/vault" component={Vault} />
          <Route path="/book/:id" component={BookDetail} />
          <Route path="/book/:id/journey/:section" component={StoryEngine} />
          <Route path="/book/:id/journey" component={StoryEngine} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MiniPlayer />
      <FullScreenPlayer />
      <BottomNav />
    </AudioProvider>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (location.startsWith("/admin")) {
    return (
      <Switch>
        <Route path="/admin" component={AdminBooks} />
        <Route path="/admin/books/:id" component={AdminBookEditor} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
