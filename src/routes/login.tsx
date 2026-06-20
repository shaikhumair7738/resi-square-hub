import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Resisquare" }, { name: "description", content: "Sign in to your Resisquare workspace." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Resisquare workspace."
      footer={<>New to Resisquare? <Link to="/register" className="font-medium text-teal hover:underline">Create an account</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            toast.success("Signed in (simulated). Use the demo role switcher to explore.");
            navigate({ to: "/" });
          }, 600);
        }}
      >
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required placeholder="you@agency.co.uk" className="mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pw">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">Forgot password?</Link>
          </div>
          <Input id="pw" type="password" required placeholder="••••••••" className="mt-1" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-teal hover:bg-teal/90 text-teal-foreground">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          This prototype does not check credentials. Any input continues.
        </p>
      </form>
    </AuthShell>
  );
}
