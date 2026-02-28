import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AudioProvider } from "@/lib/audio-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { BottomNav } from "@/components/bottom-nav";
import { MiniPlayer } from "@/components/mini-player";
import { FullScreenPlayer } from "@/components/full-screen-player";
import { PageTransition } from "@/components/page-transition";
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
import AdminUsers from "@/pages/admin/admin-users";
import AdminLogin from "@/pages/admin/admin-login";
import AdminAccessDenied from "@/pages/admin/admin-access-denied";
import AnalyticsDashboard from "@/pages/admin/analytics-dashboard";
import AdminShorts from "@/pages/admin/admin-shorts";
import AdminShortEditor from "@/pages/admin/admin-short-editor";
import ShortsPage from "@/pages/shorts-page";
import { getQueryFn } from "@/lib/queryClient";
import type { UserInterest } from "@shared/schema";
import { hasMinRole } from "@shared/models/auth";
import { NotificationPrompt } from "@/components/notification-prompt";
import { OfflineBanner } from "@/components/offline-banner";
import { InstallPrompt } from "@/components/install-prompt";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications";

function AuthenticatedApp() {
  const [location] = useLocation();
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

  if (location === "/shorts" || location.startsWith("/shorts/book/")) {
    return (
      <AudioProvider>
        <Switch>
          <Route path="/shorts" component={ShortsPage} />
          <Route path="/shorts/book/:bookId" component={ShortsPage} />
        </Switch>
      </AudioProvider>
    );
  }

  return (
    <AudioProvider>
      <div className="max-w-2xl mx-auto pb-16">
        <PageTransition key={location}>
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
        </PageTransition>
      </div>
      <MiniPlayer />
      <FullScreenPlayer />
      <BottomNav />
      <NotificationPrompt />
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
    if (location.startsWith("/admin")) {
      return <AdminLogin />;
    }
    return <LandingPage />;
  }

  if (location.startsWith("/admin")) {
    if (!hasMinRole(user.role, "writer")) {
      return <AdminAccessDenied />;
    }
    return (
      <Switch>
        <Route path="/admin" component={AdminBooks} />
        <Route path="/admin/books/:id" component={AdminBookEditor} />
        <Route path="/admin/shorts" component={AdminShorts} />
        <Route path="/admin/shorts/new" component={AdminShortEditor} />
        <Route path="/admin/shorts/:id/edit" component={AdminShortEditor} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/analytics" component={AnalyticsDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <OfflineBanner />
            <InstallPrompt />
            <AppRouter />
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
