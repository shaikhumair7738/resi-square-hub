import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

const search = z.object({ plan: z.enum(["landlord", "agent"]).default("agent") });

export const Route = createFileRoute("/checkout/success")({
  head: () => ({ meta: [{ title: "Welcome to Resisquare" }, { name: "robots", content: "noindex" }] }),
  validateSearch: search,
  component: SuccessPage,
});

function SuccessPage() {
  const { plan } = Route.useSearch();
  return (
    <div className="min-h-dvh bg-secondary/30">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Badge className="bg-teal text-teal-foreground hover:bg-teal/90">Trial active</Badge>
        </div>
      </header>
      <div className="container-page py-16">
        <Card className="mx-auto max-w-2xl border bg-card shadow-card">
          <CardContent className="p-10 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-14 w-14 text-teal" aria-hidden="true" />
            <h1 className="text-3xl font-semibold tracking-tight">You&apos;re all set</h1>
            <p className="text-muted-foreground">
              Your 14-day trial is now active. We&apos;ve set you up as the {plan === "agent" ? "Estate Agent Admin (Amelia Hart)" : "Landlord Subscriber (Aisha Khan)"}.
            </p>
            <div className="rounded-xl border bg-background p-5 text-left text-sm">
              <p className="font-medium">What&apos;s next</p>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-teal mt-0.5" /> Set up your company profile and {plan === "agent" ? "branches" : "first property"}.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-teal mt-0.5" /> Invite portal users (free) and {plan === "agent" ? "staff seats" : "an optional property manager"}.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-teal mt-0.5" /> Explore the demo role switcher to see every persona.</li>
              </ul>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-teal-foreground">
                <Link to="/app">Go to dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">Review plan</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Use the floating <strong>Demo role</strong> switcher to preview every persona, including portals for tenants, contractors and owners.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
