import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

const search = z.object({
  plan: z.enum(["landlord", "agent"]).optional(),
  interval: z.enum(["monthly", "annual"]).optional(),
});

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify email — Resisquare" }] }),
  validateSearch: search,
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const { plan, interval } = Route.useSearch();
  return (
    <AuthShell title="Check your email" subtitle="We've sent a verification link (simulated).">
      <div className="rounded-xl border bg-accent/40 p-6 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-teal" aria-hidden="true" />
        <p className="mt-3 text-sm">
          For this prototype, click below to mark your email as verified and continue to checkout.
        </p>
        <Button
          className="mt-4 bg-teal hover:bg-teal/90 text-teal-foreground"
          onClick={() => navigate({ to: "/checkout", search: { plan: plan ?? "agent", interval: interval ?? "monthly" } })}
        >
          I&apos;ve verified &mdash; continue to checkout
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Didn&apos;t get the email? Check spam, or resend (simulated).
      </p>
    </AuthShell>
  );
}
