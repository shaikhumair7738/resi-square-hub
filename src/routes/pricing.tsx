import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ADDONS, PLANS, type Interval, type Plan } from "@/lib/pricing";
import { gbp } from "@/lib/format";
import { CheckCircle2, Info } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Resisquare" },
      { name: "description", content: "Simple Landlord and Estate Agent plans. Monthly or annual. Prices excluding VAT." },
      { property: "og:title", content: "Resisquare pricing" },
      { property: "og:description", content: "Landlord £19/month. Estate Agent £149/month. Annual gives two months free." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Pricing</Badge>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Straightforward plans, no per-portal fees</h1>
          <p className="mt-3 text-muted-foreground">
            Tenant, Contractor and Owner portals are free and do not count as staff seats. All prices shown
            <strong> excluding VAT</strong>.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-card">
            <span className={interval === "monthly" ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
              Monthly
            </span>
            <Switch
              checked={interval === "annual"}
              onCheckedChange={(v) => setInterval(v ? "annual" : "monthly")}
              aria-label="Toggle billing interval"
            />
            <span className={interval === "annual" ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
              Annual
            </span>
            <Badge className="ml-2 bg-teal text-teal-foreground hover:bg-teal/90">2 months free</Badge>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              interval={interval}
              onSelect={() =>
                navigate({ to: "/checkout", search: { plan: p.id, interval } })
              }
            />
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Add-ons</h2>
            <Badge variant="outline">+ VAT</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Mix and match capacity. Add-ons are billed on the same interval as your base plan.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADDONS.map((a) => (
              <Card key={a.id} className="border bg-card shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{a.name}</h3>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {gbp(a.price, { showPence: false })}
                      <span className="text-muted-foreground text-xs">{a.unit}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {a.appliesTo.map((id) => (
                      <Badge key={id} variant="secondary" className="capitalize text-[10px]">
                        {id === "agent" ? "Estate Agent" : "Landlord"}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border bg-accent/40 p-6 md:grid-cols-[auto_1fr] md:p-8">
          <Info className="h-6 w-6 text-teal" aria-hidden="true" />
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Tenant, Contractor and Owner portals do not count as staff seats.</strong> Invite as many as you need. They have view-only or assigned access.</p>
            <p>14-day free trial on every plan. First charge is on day 15 unless you cancel. Annual billing gives two months free.</p>
            <p>Resisquare is a UK product. We invoice in GBP and we are happy to provide a VAT invoice once VAT registered.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function PlanCard({ plan, interval, onSelect }: { plan: Plan; interval: Interval; onSelect: () => void }) {
  const price = interval === "annual" ? plan.annual : plan.monthly;
  const per = interval === "annual" ? "/year" : "/month";
  const monthlyEquivalent = interval === "annual" ? plan.annual / 12 : null;
  const isAgent = plan.id === "agent";
  return (
    <Card className={`relative border-2 bg-card shadow-card ${isAgent ? "border-teal" : "border-border"}`}>
      {isAgent && (
        <Badge className="absolute -top-3 left-6 bg-teal text-teal-foreground hover:bg-teal/90">Most popular</Badge>
      )}
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{plan.audience}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight">{gbp(price, { showPence: false })}</span>
          <span className="text-sm text-muted-foreground">{per} <span className="text-xs">+ VAT</span></span>
        </div>
        {monthlyEquivalent !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            Equivalent to {gbp(monthlyEquivalent, { showPence: false })}/month
          </p>
        )}
        <Button
          onClick={onSelect}
          size="lg"
          className={`mt-6 w-full ${isAgent ? "bg-teal hover:bg-teal/90 text-teal-foreground" : "bg-brand hover:bg-brand/90 text-brand-foreground"}`}
        >
          Start 14-day trial
        </Button>
        <div className="mt-6 grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Includes</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {plan.includes.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal" aria-hidden="true" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Highlights</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {plan.highlights.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal" aria-hidden="true" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
