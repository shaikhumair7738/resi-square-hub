import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const NAV = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClick}
          activeProps={{ className: "text-foreground" }}
          inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          className="text-sm font-medium transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            <NavLinks />
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground">
              <Link to="/register">Start free trial</Link>
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-4 flex flex-col gap-5">
                <NavLinks onClick={() => setOpen(false)} />
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                  <Button asChild className="bg-teal hover:bg-teal/90 text-teal-foreground">
                    <Link to="/register" onClick={() => setOpen(false)}>Start free trial</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t bg-brand text-brand-foreground/85">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Logo variant="light" className="text-white" />
          <p className="text-sm text-brand-foreground/70 max-w-xs">
            UK property management for self-managing landlords and letting agencies.
          </p>
        </div>
        <FooterCol title="Product" items={[
          { to: "/features", label: "Features" },
          { to: "/pricing", label: "Pricing" },
          { to: "/faq", label: "FAQ" },
        ]} />
        <FooterCol title="Company" items={[
          { to: "/contact", label: "Contact & demo" },
          { to: "/register", label: "Start free trial" },
          { to: "/login", label: "Sign in" },
        ]} />
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white">Prototype notice</h4>
          <p className="text-brand-foreground/70">
            This is a clickable product prototype. Stripe screens are simulated; no real card details are collected.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-brand-foreground/60 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Resisquare. Sample data &mdash; not legal advice.</span>
          <span>Made in the UK</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div className="space-y-3 text-sm">
      <h4 className="font-semibold text-white">{title}</h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-brand-foreground/70 hover:text-white">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
