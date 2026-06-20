import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import type { Interval, PlanId } from "@/lib/pricing";
import { PLANS } from "@/lib/pricing";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Resisquare" }, { name: "description", content: "Create a Resisquare workspace as a landlord or estate agent." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanId>("agent");
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <AuthShell
      title="Start your free trial"
      subtitle="14 days free. No card required for this prototype."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-teal hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/verify-email", search: { plan, interval } });
        }}
      >
        <div className="space-y-3">
          <Label>I am registering as</Label>
          <RadioGroup value={plan} onValueChange={(v) => setPlan(v as PlanId)} className="grid grid-cols-2 gap-3">
            {PLANS.map((p) => (
              <label
                key={p.id}
                htmlFor={`plan-${p.id}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
                  plan === p.id ? "border-teal bg-accent/50" : "border-border hover:bg-secondary/60"
                }`}
              >
                <RadioGroupItem value={p.id} id={`plan-${p.id}`} className="mt-1" />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.audience}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-secondary/40 p-4 text-sm">
          <div>
            <p className="font-medium">Billing interval</p>
            <p className="text-xs text-muted-foreground">Annual gives two months free.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={interval === "monthly" ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
            <Switch checked={interval === "annual"} onCheckedChange={(v) => setInterval(v ? "annual" : "monthly")} aria-label="Billing interval" />
            <span className={interval === "annual" ? "font-semibold" : "text-muted-foreground"}>Annual</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="first" label="First name" />
          <Field id="last" label="Last name" />
        </div>
        <Field id="email" label="Work email" type="email" required />
        <Field id="company" label={plan === "agent" ? "Agency name" : "Portfolio name"} required />
        <Field id="pw" label="Choose a password" type="password" required />

        <Button type="submit" className="w-full bg-teal hover:bg-teal/90 text-teal-foreground">
          Continue
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to the Resisquare sample Terms and Privacy notice.
        </p>
      </form>
    </AuthShell>
  );
}

function Field({ id, label, type = "text", required }: { id: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id}>{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</Label>
      <Input id={id} type={type} required={required} className="mt-1" />
    </div>
  );
}
