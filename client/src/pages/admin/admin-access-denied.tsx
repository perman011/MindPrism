import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import mindprismLogo from "@assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png";

export default function AdminAccessDenied() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
      <SEOHead title="Access Denied" noIndex />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 mix-blend-screen">
            <img src={mindprismLogo} alt="MindPrism" className="h-32 object-contain opacity-60" style={{ aspectRatio: '1.618' }} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1" data-testid="text-access-denied">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access the admin portal.
          </p>
        </div>

        <Card className="bg-card/80 border-border backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This area is restricted to team members with admin privileges. If you believe this is an error, contact your administrator.
            </p>

            <Link href="/">
              <Button
                className="w-full gap-2"
                data-testid="link-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to MindPrism App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
