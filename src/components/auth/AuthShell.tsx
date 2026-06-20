import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-brand p-10 text-white">
        <Logo variant="light" className="text-white" />
        <div className="space-y-5 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Property management built for the UK.</h2>
          <p className="text-white/80">
            Tenancies, rent, maintenance and compliance &mdash; all in one calm place. Sample data is fully UK formatted.
          </p>
          <p className="text-xs text-white/60">Prototype: simulated authentication. Use any details to continue.</p>
        </div>
        <p className="text-xs text-white/60">&copy; {new Date().getFullYear()} Resisquare</p>
      </div>
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          <p className="mt-8 text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">&larr; Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
