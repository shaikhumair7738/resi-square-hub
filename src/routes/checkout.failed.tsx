import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const search = z.object({ plan: z.enum(["landlord", "agent"]).default("agent") });

export const Route = createFileRoute("/checkout/failed")({
  head: () => ({ meta: [{ title: "Payment failed — Resisquare" }, { name: "robots", content: "noindex" }] }),
  validateSearch: search,
  component: FailedPage,
});

function FailedPage() {
  const navigate = useNavigate();
  const { plan } = Route.useSearch();
  return (
    <div className="min-h-dvh bg-secondary/30">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
        </div>
      </header>
      <div className="container-page py-16">
        <Card className="mx-auto max-w-xl border bg-card shadow-card">
          <CardContent className="p-10 text-center space-y-4">
            <XCircle className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-tight">Payment couldn&apos;t be completed</h1>
            <p className="text-muted-foreground">
              The simulated payment was declined. No charge was attempted. You can retry with the same plan or pick a different one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" onClick={() => navigate({ to: "/checkout", search: { plan, interval: "monthly" } })} className="bg-teal hover:bg-teal/90 text-teal-foreground">
                Retry payment
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">Change plan</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/contact">Contact support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
