import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import mindprismLogo from "@assets/IMG_5128_1772146157123.jpeg";

export default function AdminAccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-4 ring-2 ring-red-500/20">
            <img src={mindprismLogo} alt="MindPrism" className="w-full h-full object-cover opacity-60" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1" data-testid="text-access-denied">
            Access Denied
          </h1>
          <p className="text-sm text-slate-400">
            You don't have permission to access the admin portal.
          </p>
        </div>

        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-400 text-center">
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
