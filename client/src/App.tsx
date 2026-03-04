import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AudioProvider } from "@/lib/audio-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { MiniPlayer } from "@/components/mini-player";
import { FullScreenPlayer } from "@/components/full-screen-player";
import { PageTransition } from "@/components/page-transition";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getQueryFn } from "@/lib/queryClient";
import type { UserInterest } from "@shared/schema";
import { hasMinRole } from "@shared/models/auth";
import { NotificationPrompt } from "@/components/notification-prompt";
import { OfflineBanner } from "@/components/offline-banner";
import { InstallPrompt } from "@/components/install-prompt";
import { lazy, Suspense, useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications";

const LandingPage = lazy(() => import("@/pages/landing"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Discover = lazy(() => import("@/pages/discover"));
const AudioPage = lazy(() => import("@/pages/audio"));
const Vault = lazy(() => import("@/pages/vault"));
const BookDetail = lazy(() => import("@/pages/book-detail"));
const StoryEngine = lazy(() => import("@/pages/story-engine"));
const ChapterReader = lazy(() => import("@/pages/chapter-reader"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminBooks = lazy(() => import("@/pages/admin/admin-books"));
const AdminBookEditor = lazy(() => import("@/pages/admin/admin-book-editor"));
const AdminUsers = lazy(() => import("@/pages/admin/admin-users"));
const AdminLogin = lazy(() => import("@/pages/admin/admin-login"));
const AdminAccessDenied = lazy(() => import("@/pages/admin/admin-access-denied"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/analytics-dashboard"));
const AdminShorts = lazy(() => import("@/pages/admin/admin-shorts"));
const AdminShortEditor = lazy(() => import("@/pages/admin/admin-short-editor"));
const AdminMediaLibrary = lazy(() => import("@/pages/admin/admin-media-library"));
const ShortsPage = lazy(() => import("@/pages/shorts-page"));

function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

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
    return (
      <Suspense fallback={<LazyFallback />}>
        <Onboarding />
      </Suspense>
    );
  }

  if (location === "/shorts" || location.startsWith("/shorts/book/")) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <AudioProvider>
          <Switch>
            <Route path="/shorts" component={ShortsPage} />
            <Route path="/shorts/book/:bookId" component={ShortsPage} />
          </Switch>
        </AudioProvider>
      </Suspense>
    );
  }

  return (
    <AudioProvider>
      <Suspense fallback={<LazyFallback />}>
        <div className="max-w-2xl mx-auto pb-20">
          <PageTransition key={location}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/discover" component={Discover} />
              <Route path="/audio" component={AudioPage} />
              <Route path="/vault" component={Vault} />
              <Route path="/book/:id" component={BookDetail} />
              <Route path="/book/:id/read" component={ChapterReader} />
              <Route path="/book/:id/journey/:section" component={StoryEngine} />
              <Route path="/book/:id/journey" component={StoryEngine} />
              <Route component={NotFound} />
            </Switch>
          </PageTransition>
        </div>
      </Suspense>
      <MiniPlayer />
      <FullScreenPlayer />
      <BottomNav />
      <NotificationPrompt />
    </AudioProvider>
  );
}

function WelcomeRedirect() {
  return <Redirect to="/" />;
}

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (location === "/welcome") {
    return <WelcomeRedirect />;
  }

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
      return <Suspense fallback={<LazyFallback />}><AdminLogin /></Suspense>;
    }
    return <Suspense fallback={<LazyFallback />}><LandingPage /></Suspense>;
  }

  if (location.startsWith("/admin")) {
    if (!hasMinRole(user.role, "writer")) {
      return <Suspense fallback={<LazyFallback />}><AdminAccessDenied /></Suspense>;
    }
    return (
      <AdminLayout>
        <Suspense fallback={<LazyFallback />}>
          <Switch>
            <Route path="/admin" component={AdminBooks} />
            <Route path="/admin/books/:id" component={AdminBookEditor} />
            <Route path="/admin/shorts" component={AdminShorts} />
            <Route path="/admin/shorts/new" component={AdminShortEditor} />
            <Route path="/admin/shorts/:id/edit" component={AdminShortEditor} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/analytics" component={AnalyticsDashboard} />
            <Route path="/admin/media" component={AdminMediaLibrary} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AdminLayout>
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
      <ThemeProvider>
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
