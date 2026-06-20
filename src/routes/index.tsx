import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Wrench,
  ShieldCheck,
  Receipt,
  MessagesSquare,
  ArrowRight,
  CheckCircle2,
  HomeIcon,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resisquare — UK property management for agencies and landlords" },
      { name: "description", content: "Run lettings, tenancies, rent, maintenance and compliance in one place. Built for UK estate agents and self-managing landlords." },
      { property: "og:title", content: "Resisquare — UK property management" },
      { property: "og:description", content: "Lettings, tenancies, rent, maintenance and compliance for UK agents and landlords." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PublicLayout>
      <Hero />
      <LogoStrip />
      <Benefits />
      <Modules />
      <PortalSection />
      <Testimonials />
      <CTASection />
    </PublicLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-brand text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky blur-3xl" />
      </div>
      <div className="container-page relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
        <div className="space-y-6">
          <Badge className="bg-white/15 text-white hover:bg-white/15 border-white/20">Built for the UK lettings market</Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            One calm place to run every property, tenancy and contractor.
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            Resisquare gives letting agencies and self-managing landlords the tools to handle properties, tenancies,
            rent, maintenance, compliance and contractor workflow &mdash; with portals for tenants, contractors and owners.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-teal text-teal-foreground hover:bg-teal/90">
              <Link to="/register">Start 14-day free trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact">Book a demo</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            {["No credit card to start trial", "GDPR-aware", "UK addresses & GBP", "Cancel anytime"].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden="true" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md shadow-2xl">
        <div className="rounded-xl bg-card p-5 text-foreground shadow-card">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="text-xs text-muted-foreground">Northstar Lettings &middot; Manchester</p>
              <h3 className="font-semibold">Dashboard</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Estate Agent</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Active properties" value="84 / 100" />
            <Stat label="Occupancy" value="91%" tone="teal" />
            <Stat label="Rent due (Jul)" value="£128,450" />
            <Stat label="Overdue" value="£9,820" tone="warn" />
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> 17 open maintenance requests
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> 8 compliance items expiring this month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "teal" | "warn" }) {
  const toneCls =
    tone === "teal"
      ? "text-teal"
      : tone === "warn"
        ? "text-warn-foreground"
        : "text-foreground";
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-semibold ${toneCls}`}>{value}</p>
    </div>
  );
}

function LogoStrip() {
  return (
    <section className="border-y bg-secondary/40">
      <div className="container-page py-6 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Trusted by independent letting agents and landlord portfolios across England
          <span className="ml-2 text-[10px] text-muted-foreground/70">(sample brands)</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-muted-foreground">
          {["Northstar Lettings", "Salford Quays Property", "Park Row Estates", "Aisha Khan Portfolio", "Peak District Homes"].map((n) => (
            <span key={n} className="text-sm font-semibold tracking-tight opacity-70">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    {
      icon: Building2,
      title: "For estate agents",
      body: "Multi-branch operations, staff roles, lead-to-tenancy pipeline, rent runs, arrears and compliance &mdash; all in one place.",
      points: ["Branches & staff seats", "Granular role templates", "Bulk rent invoicing", "Reports & exports"],
    },
    {
      icon: HomeIcon,
      title: "For landlords",
      body: "Self-manage a small portfolio without the spreadsheets. Add a property manager when you want a human to take it on.",
      points: ["Rent ledger & receipts", "Tenant & contractor portals", "Compliance reminders", "Optional Property Manager add-on"],
    },
  ];
  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary">Built for two audiences</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">One platform, two ways to use it</h2>
        <p className="mt-3 text-muted-foreground">
          Agencies need branches, staff and reporting. Landlords need simplicity. Resisquare gives each side exactly the
          surface they need &mdash; nothing more, nothing missing.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((b) => (
          <Card key={b.title} className="border bg-card shadow-card">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <b.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: b.body }} />
              <ul className="mt-5 space-y-2 text-sm">
                {b.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Modules() {
  const mods = [
    { icon: Building2, title: "Properties", body: "UK addresses, references, types, owners, compliance and media." },
    { icon: Users, title: "Contacts", body: "Landlords, owners, tenants, contractors and property managers in one CRM." },
    { icon: Receipt, title: "Rent & invoices", body: "Recurring rent, part-payments, statements and arrears." },
    { icon: Wrench, title: "Maintenance & work orders", body: "Triage, quote requests, contractor selection and timelines." },
    { icon: ShieldCheck, title: "Compliance", body: "EPC, Gas Safety, EICR and deposit evidence with expiry reminders." },
    { icon: MessagesSquare, title: "Communications", body: "Threaded messaging across staff, tenants and contractors." },
    { icon: BarChart3, title: "Reports", body: "Occupancy, rent collection, maintenance response and branch performance." },
    { icon: Users, title: "Branches & staff", body: "Roles, permission templates and per-branch scope (agencies only)." },
  ];
  return (
    <section className="border-y bg-secondary/40 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Modules</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Everything letting needs, nothing it doesn't</h2>
          <p className="mt-3 text-muted-foreground">
            A focused product instead of a sprawling CRM. Designed around UK lettings terminology and workflow.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mods.map((m) => (
            <Card key={m.title} className="border bg-card shadow-card">
              <CardContent className="p-5">
                <m.icon className="h-6 w-6 text-teal" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortalSection() {
  const portals = [
    {
      title: "Tenant portal",
      body: "Tenants see their tenancy, next rent invoice, payment history and shared documents. They report maintenance with photos and availability.",
      free: "Tenant accounts are free &mdash; never counted as staff seats.",
    },
    {
      title: "Contractor portal",
      body: "Contractors see jobs assigned to them. They submit quotes, update status and upload completion photos and invoices.",
      free: "Contractor portals are free.",
    },
    {
      title: "Owner portal",
      body: "Owners see linked properties, occupancy and a curated set of shared reports and documents &mdash; read-only.",
      free: "Owner portals are free.",
    },
  ];
  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary">Portals</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Bring everyone in &mdash; without paying per seat</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {portals.map((p) => (
          <Card key={p.title} className="border bg-card shadow-card">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
              <p className="text-xs font-medium text-teal" dangerouslySetInnerHTML={{ __html: p.free }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote: "Switching from spreadsheets has been a relief. The maintenance flow alone has paid for itself.",
      name: "Aisha K.",
      role: "Landlord, sample customer",
    },
    {
      quote: "Roles and branch scope finally match how we actually work. Our accountant only sees what she should.",
      name: "Amelia H.",
      role: "Director, sample agency",
    },
    {
      quote: "The contractor portal removed about a dozen WhatsApp threads from my week.",
      name: "Daniel O.",
      role: "Branch manager, sample agency",
    },
  ];
  return (
    <section className="border-t bg-secondary/40 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">From early users</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A calmer week in the office</h2>
          <p className="mt-2 text-xs text-muted-foreground">Quotes are illustrative sample testimonials.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map((q) => (
            <Card key={q.name} className="border bg-card shadow-card">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-foreground">&ldquo;{q.quote}&rdquo;</p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">{q.name} &middot; {q.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="container-page py-20">
      <div className="rounded-3xl bg-gradient-brand p-10 text-white md:p-14">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Try Resisquare free for 14 days</h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Pick a plan, set up your workspace and start adding properties in minutes. No card required.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-teal-foreground">
              <Link to="/register">Start free trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
