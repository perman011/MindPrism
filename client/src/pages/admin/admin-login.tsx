import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
      <SEOHead title="Admin Login" noIndex />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 mix-blend-screen">
            <img src={mindprismLogo} alt="MindPrism" className="h-36 object-contain" style={{ aspectRatio: '1.618' }} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1" data-testid="text-admin-title">
            Admin Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Content Management Portal
          </p>
        </div>

        <Card className="bg-card/80 border-border backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-medium text-violet-400">Authorized Personnel Only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in with your admin credentials to access the content management system.
              </p>
            </div>

            <a href="/api/login?returnTo=/admin" className="block">
              <Button
                className="w-full gap-2 h-12 text-base font-semibold"
                size="lg"
                data-testid="button-admin-login"
              >
                <Shield className="w-5 h-5" />
                Sign In to Admin Portal
              </Button>
            </a>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Link href="/">
              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground hover:text-white hover:bg-muted"
                data-testid="link-back-to-app"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to MindPrism App
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Only team members with admin privileges can access this portal.
        </p>
      </div>
    </div>
  );
}
