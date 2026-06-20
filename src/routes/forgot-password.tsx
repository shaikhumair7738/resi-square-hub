import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Resisquare" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to="/login" className="text-teal hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <div className="space-y-4 rounded-xl border bg-accent/40 p-5 text-sm">
          <p>If an account exists for that email, a reset link is on the way. (Simulated.)</p>
          <Button onClick={() => navigate({ to: "/reset-password" })} className="bg-teal hover:bg-teal/90 text-teal-foreground">
            Open simulated reset link
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Reset email sent (simulated).");
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-teal hover:bg-teal/90 text-teal-foreground">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
