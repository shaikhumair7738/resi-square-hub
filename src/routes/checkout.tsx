import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ADDONS, PLANS, type Interval, type PlanId } from "@/lib/pricing";
import { gbp, ukDateLong } from "@/lib/format";
import { useProto } from "@/lib/proto-store";
import { Check, Lock, AlertTriangle, Loader2, X } from "lucide-react";

const search = z.object({
  plan: z.enum(["landlord", "agent"]).default("agent"),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
});

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Resisquare (Simulated)" }, { name: "robots", content: "noindex" }] }),
  validateSearch: search,
  component: CheckoutPage,
});

type Step = "account" | "summary" | "stripe" | "processing";

function CheckoutPage() {
  const { plan: planId, interval: intervalParam } = Route.useSearch();
  const navigate = useNavigate();
  const proto = useProto();
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];
  const [interval, setInterval] = useState<Interval>(intervalParam);
  const [addOns, setAddOns] = useState<Record<string, number>>({});
  const [workspaceName, setWorkspaceName] = useState(planId === "agent" ? "Northstar Lettings Ltd" : "Aisha Khan Portfolio");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("account");

  const planPrice = interval === "annual" ? plan.annual : plan.monthly;
  const addOnTotal = Object.entries(addOns).reduce((sum, [id, qty]) => {
    const a = ADDONS.find((x) => x.id === id);
    if (!a) return sum;
    return sum + a.price * qty * (interval === "annual" ? 10 : 1); // annual: 2 months free
  }, 0);
  const subtotal = planPrice + addOnTotal;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  const eligibleAddons = useMemo(() => ADDONS.filter((a) => a.appliesTo.includes(plan.id)), [plan.id]);

  const renewalDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  }, []);

  function completeCheckout(planId: PlanId) {
    proto.upsertSubscription({
      workspaceId: planId === "agent" ? "ws-northstar" : "ws-aisha",
      planId,
      interval,
      status: "trialing",
      trialEndsAt: renewalDate.toISOString(),
      currentPeriodEnd: renewalDate.toISOString(),
      addOns,
    });
    proto.setActiveRole(planId === "agent" ? "agent_admin" : "landlord_owner");
  }

  return (
    <div className="min-h-dvh bg-secondary/30">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Back to pricing</Link>
        </div>
      </header>
      <div className="container-page py-10">
        <Steps current={step} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {step === "account" && (
              <Card className="border bg-card shadow-card">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <h2 className="text-xl font-semibold">Account &amp; workspace</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="ws">Workspace name</Label>
                      <Input id="ws" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="mt-1" required />
                      <p className="mt-1 text-xs text-muted-foreground">{plan.id === "agent" ? "Agency trading name" : "Your portfolio name"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="em">Billing email</Label>
                      <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required placeholder="billing@example.co.uk" />
                    </div>
                    <div>
                      <Label htmlFor="addr">Address line 1</Label>
                      <Input id="addr" className="mt-1" defaultValue="24 Deansgate Mews" />
                    </div>
                    <div>
                      <Label htmlFor="city">City / town</Label>
                      <Input id="city" className="mt-1" defaultValue="Manchester" />
                    </div>
                    <div>
                      <Label htmlFor="pc">Postcode</Label>
                      <Input id="pc" className="mt-1" defaultValue="M3 2BW" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" className="mt-1" defaultValue="United Kingdom" />
                    </div>
                  </div>

                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Billing interval</p>
                      <p className="text-xs text-muted-foreground">Annual gives two months free.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={interval === "monthly" ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
                      <Switch checked={interval === "annual"} onCheckedChange={(v) => setInterval(v ? "annual" : "monthly")} aria-label="Billing interval" />
                      <span className={interval === "annual" ? "font-semibold" : "text-muted-foreground"}>Annual</span>
                    </div>
                  </div>

                  <Separator />
                  <div>
                    <p className="font-medium">Add-ons (optional)</p>
                    <p className="text-xs text-muted-foreground">Mix and match capacity. Add-ons are billed on the same interval.</p>
                    <ul className="mt-3 space-y-2">
                      {eligibleAddons.map((a) => {
                        const qty = addOns[a.id] ?? 0;
                        return (
                          <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{gbp(a.price, { showPence: false })}{a.unit} &middot; {a.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="outline" className="h-8 w-8" type="button" aria-label={`Decrease ${a.name}`}
                                onClick={() => setAddOns((s) => ({ ...s, [a.id]: Math.max(0, (s[a.id] ?? 0) - 1) }))}>
                                <X className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                              <Button size="sm" variant="outline" className="h-8" type="button"
                                onClick={() => setAddOns((s) => ({ ...s, [a.id]: (s[a.id] ?? 0) + 1 }))}>
                                Add
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="lg" disabled={!email || !workspaceName} onClick={() => setStep("summary")} className="bg-teal hover:bg-teal/90 text-teal-foreground">
                      Continue to summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "summary" && (
              <Card className="border bg-card shadow-card">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <h2 className="text-xl font-semibold">Order summary</h2>
                  <p className="text-sm text-muted-foreground">
                    14-day free trial. First charge on <strong>{ukDateLong(renewalDate)}</strong> unless you cancel.
                    All prices exclude VAT.
                  </p>
                  <div className="rounded-xl border bg-background p-4">
                    <Row label={`Resisquare ${plan.name} (${interval})`} value={`${gbp(planPrice, { showPence: false })}/${interval === "annual" ? "yr" : "mo"}`} />
                    {Object.entries(addOns).filter(([, q]) => q > 0).map(([id, qty]) => {
                      const a = ADDONS.find((x) => x.id === id)!;
                      return (
                        <Row
                          key={id}
                          label={`${a.name} × ${qty}`}
                          value={`${gbp(a.price * qty * (interval === "annual" ? 10 : 1), { showPence: false })}/${interval === "annual" ? "yr" : "mo"}`}
                        />
                      );
                    })}
                    <Separator className="my-3" />
                    <Row label="Subtotal" value={gbp(subtotal)} />
                    <Row label="VAT (20% placeholder)" value={gbp(vat)} muted />
                    <Separator className="my-3" />
                    <Row label="Total due on renewal" value={gbp(total)} bold />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={() => setStep("account")}>Back</Button>
                    <Button size="lg" onClick={() => setStep("stripe")} className="bg-teal hover:bg-teal/90 text-teal-foreground">
                      Continue to payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "stripe" && (
              <StripeSimCard
                total={total}
                onSuccess={() => {
                  setStep("processing");
                  completeCheckout(plan.id);
                  setTimeout(() => navigate({ to: "/checkout/success", search: { plan: plan.id } }), 1400);
                }}
                onFail={() => {
                  toast.error("Simulated payment failure: card was declined.");
                  navigate({ to: "/checkout/failed", search: { plan: plan.id } });
                }}
                onCancel={() => navigate({ to: "/pricing" })}
              />
            )}

            {step === "processing" && (
              <Card className="border bg-card shadow-card">
                <CardContent className="p-10 text-center space-y-3">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal" />
                  <p className="font-medium">Confirming your subscription…</p>
                  <p className="text-sm text-muted-foreground">Setting up your workspace and starting your 14-day trial.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="border bg-card shadow-card sticky top-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name} plan</h3>
                  <Badge variant="secondary" className="capitalize">{interval}</Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <Row label="Plan" value={`${gbp(planPrice, { showPence: false })}/${interval === "annual" ? "yr" : "mo"}`} />
                  <Row label="Add-ons" value={gbp(addOnTotal, { showPence: false })} />
                  <Row label="VAT (placeholder)" value={gbp(vat)} muted />
                </div>
                <Separator />
                <Row label="Total" value={gbp(total)} bold />
                <p className="text-xs text-muted-foreground">
                  First charge on {ukDateLong(renewalDate)}. Cancel anytime during the trial.
                </p>
                <div className="rounded-lg bg-accent/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 mt-0.5 text-teal" />
                  <span>This is a <strong>simulated</strong> checkout. No real card details are collected.</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Steps({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "summary", label: "Summary" },
    { id: "stripe", label: "Payment" },
    { id: "processing", label: "Confirm" },
  ];
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
            i <= idx ? "bg-teal text-teal-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {i < idx ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className={i === idx ? "font-semibold text-foreground" : "text-muted-foreground"}>{s.label}</span>
          {i < steps.length - 1 && <span className="mx-2 h-px w-6 bg-border" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 text-sm ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold text-foreground" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StripeSimCard({ total, onSuccess, onFail, onCancel }: { total: number; onSuccess: () => void; onFail: () => void; onCancel: () => void }) {
  return (
    <Card className="border-2 border-dashed border-teal/40 bg-card shadow-card">
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3 rounded-lg bg-warn/20 p-3 text-warn-foreground">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Simulated Stripe Checkout</p>
            <p className="text-xs">This screen mimics Stripe&apos;s UI for prototype purposes only. Never enter real card details here.</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Pay {gbp(total)}</h2>

        <div className="space-y-3">
          <div>
            <Label htmlFor="cn">Card number</Label>
            <Input id="cn" placeholder="4242 4242 4242 4242 (test only)" className="mt-1 font-mono" disabled />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exp">Expiry</Label>
              <Input id="exp" placeholder="MM / YY" className="mt-1 font-mono" disabled />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="•••" className="mt-1 font-mono" disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Name on card</Label>
            <Input id="name" placeholder="Card holder name" className="mt-1" disabled />
          </div>
        </div>

        <Separator />
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={onSuccess} className="bg-teal hover:bg-teal/90 text-teal-foreground">
            Simulate successful payment
          </Button>
          <Button size="lg" variant="outline" onClick={onFail} className="border-destructive/40 text-destructive hover:bg-destructive/10">
            Simulate failed payment
          </Button>
          <Button size="lg" variant="ghost" onClick={onCancel}>
            Cancel checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
