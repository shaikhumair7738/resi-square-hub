import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProto } from "@/lib/proto-store";
import { PLANS, ADDONS } from "@/lib/pricing";
import { gbp, ukDateLong } from "@/lib/format";
import { AlertTriangle, CreditCard } from "lucide-react";

export const Route = createFileRoute("/app/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const { subscriptions, activeWorkspace, cancelSubscription, reactivateSubscription, setSubscriptionStatus } = useProto();
  const sub = subscriptions[activeWorkspace.id];

  if (!sub) {
    return (
      <AppShell title="Plan & billing">
        <Card><CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No subscription on this workspace yet.</p>
          <Button asChild className="bg-teal hover:bg-teal/90 text-teal-foreground"><Link to="/pricing">Choose a plan</Link></Button>
        </CardContent></Card>
      </AppShell>
    );
  }

  const plan = PLANS.find((p) => p.id === sub.planId)!;
  const planPrice = sub.interval === "annual" ? plan.annual : plan.monthly;
  const addOnList = Object.entries(sub.addOns).map(([id, qty]) => ({ a: ADDONS.find((x) => x.id === id)!, qty })).filter((x) => x.a);
  const addOnTotal = addOnList.reduce((s, x) => s + x.a.price * x.qty * (sub.interval === "annual" ? 10 : 1), 0);

  return (
    <AppShell title="Plan & billing" description="Manage your subscription and simulate Stripe lifecycle states.">
      {sub.status === "past_due" && (
        <Alert className="mb-4 border-destructive/40 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>Your last payment was declined. Update your card or retry to restore access to write actions.</AlertDescription>
        </Alert>
      )}
      {sub.cancelAtPeriodEnd && (
        <Alert className="mb-4 border-warn/40 bg-warn/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription will cancel</AlertTitle>
          <AlertDescription>Your subscription ends on {sub.currentPeriodEnd ? ukDateLong(sub.currentPeriodEnd) : "the next period"}. Reactivate any time before then.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{plan.name} plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{plan.audience}</p>
            </div>
            <Badge variant="outline" className="capitalize">{sub.status === "trialing" ? "Trial" : sub.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Stat label="Billing interval" value={sub.interval === "annual" ? "Annual" : "Monthly"} />
              <Stat label="Plan price" value={`${gbp(planPrice, { showPence: false })}/${sub.interval === "annual" ? "yr" : "mo"}`} />
              <Stat label="Add-ons" value={addOnList.length > 0 ? `${addOnList.length} active` : "None"} />
              <Stat label={sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} value={sub.currentPeriodEnd ? ukDateLong(sub.currentPeriodEnd) : "—"} />
            </div>
            {addOnList.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-2">Add-ons</h4>
                <ul className="space-y-1.5 text-sm">
                  {addOnList.map(({ a, qty }) => (
                    <li key={a.id} className="flex justify-between">
                      <span>{a.name} × {qty}</span>
                      <span className="text-muted-foreground">{gbp(a.price * qty * (sub.interval === "annual" ? 10 : 1), { showPence: false })}/{sub.interval === "annual" ? "yr" : "mo"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button asChild variant="outline"><Link to="/pricing">Change plan</Link></Button>
              {sub.cancelAtPeriodEnd ? (
                <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" onClick={() => { reactivateSubscription(activeWorkspace.id); toast.success("Subscription reactivated"); }}>Reactivate</Button>
              ) : (
                <Button variant="outline" onClick={() => { cancelSubscription(activeWorkspace.id); toast.success("Cancellation scheduled"); }}>Cancel at period end</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Simulate Stripe states</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Prototype helper — flip the workspace into any Stripe-style state.</p>
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => { setSubscriptionStatus(activeWorkspace.id, "active"); toast.success("Set to active"); }}>Active</Button>
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => { setSubscriptionStatus(activeWorkspace.id, "trialing"); toast.success("Set to trialing"); }}>Trialing</Button>
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => { setSubscriptionStatus(activeWorkspace.id, "past_due"); toast.error("Set to past_due"); }}>Past due (restricted)</Button>
            <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => { setSubscriptionStatus(activeWorkspace.id, "cancelled"); toast.error("Set to cancelled"); }}>Cancelled</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">Payment method</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 border rounded-lg p-3 text-sm">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Visa ending in 4242</div>
                <div className="text-xs text-muted-foreground">Expires 12/28 · Simulated. No real card on file.</div>
              </div>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => toast.info("Stripe billing portal would open here (simulated)." )}>Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
