import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Resisquare" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const mismatch = pw && pw2 && pw !== pw2;

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you don't use elsewhere.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (mismatch || pw.length < 8) return;
          toast.success("Password updated (simulated). Please sign in.");
          navigate({ to: "/login" });
        }}
      >
        <div>
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div>
          <Label htmlFor="pw2">Confirm new password</Label>
          <Input id="pw2" type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="mt-1" aria-invalid={!!mismatch} />
          {mismatch && <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>}
        </div>
        <Button type="submit" className="w-full bg-teal hover:bg-teal/90 text-teal-foreground">Update password</Button>
      </form>
    </AuthShell>
  );
}
