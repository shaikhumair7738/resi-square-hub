import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProto } from "@/lib/proto-store";
import { planPropertyLimit } from "@/lib/seed";
import { gbp, ukDate } from "@/lib/format";
import {
  Building2,
  ArrowUpRight,
  PoundSterling,
  Wrench,
  AlertTriangle,
  CalendarClock,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { activeRole, activeWorkspace, properties, subscriptions, tenancies } = useProto();
  const sub = subscriptions[activeWorkspace.id];
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id && !p.archived);
  const limit = planPropertyLimit(sub?.planId);
  const letCount = wsProps.filter((p) => p.status === "let").length;
  const vacantCount = wsProps.filter((p) => p.status === "vacant").length;
  const monthlyRent = wsProps.reduce((sum, p) => (p.status === "let" ? sum + p.rentPcm : sum), 0);
  const wsTenancies = tenancies.filter((t) => wsProps.some((p) => p.id === t.propertyId));
  const noticeCount = wsTenancies.filter((t) => t.status === "notice").length;

  const upcoming = wsProps
    .filter((p) => p.gasSafetyExpiry || p.eicrExpiry)
    .map((p) => ({
      property: p,
      next: [p.gasSafetyExpiry, p.eicrExpiry].filter(Boolean).sort()[0] as string,
    }))
    .sort((a, b) => a.next.localeCompare(b.next))
    .slice(0, 4);

  const isAgency = activeWorkspace.type === "agency";
  const greeting = activeRole.label.split("·")[1]?.trim() ?? activeRole.label;

  return (
    <AppShell
      title={isAgency ? `Welcome back, ${greeting}` : `Welcome back, ${greeting}`}
      description={
        isAgency
          ? "Live snapshot across your branches, properties and tenancies."
          : "Overview of your portfolio, tenancies and upcoming compliance."
      }
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/properties">View properties</Link>
          </Button>
          <Button asChild size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground">
            <Link to="/app/properties/new">
              <Plus className="h-4 w-4" /> Add property
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Properties" value={`${wsProps.length}`} hint={`${letCount} let · ${vacantCount} vacant`} />
        <StatCard icon={PoundSterling} label="Monthly rent roll" value={gbp(monthlyRent, { showPence: false })} hint="Active tenancies" />
        <StatCard icon={CalendarClock} label="Tenancies on notice" value={`${noticeCount}`} hint="Ending within 60 days" />
        <StatCard icon={Wrench} label="Open maintenance" value="3" hint="Across all properties" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent properties</CardTitle>
              <CardDescription>Most recently created in this workspace</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/properties">
                All properties <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsProps.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to="/app/properties/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{p.address.line1}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.address.city} · {p.address.postcode} · {p.bedrooms} bed {p.type}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-semibold text-foreground">{gbp(p.rentPcm, { showPence: false })}<span className="text-xs text-muted-foreground font-normal"> pcm</span></div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
            {wsProps.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">No properties yet. Add your first one to get started.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan usage</CardTitle>
              <CardDescription>
                {sub ? <>{sub.planId === "agent" ? "Estate Agent" : "Landlord"} plan · {sub.status === "trialing" ? "Trial" : sub.status}</> : "No subscription"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Properties</span>
                  <span className="font-medium">{wsProps.length} / {limit}</span>
                </div>
                <Progress value={(wsProps.length / limit) * 100} className="mt-1.5 h-2" />
              </div>
              {sub?.currentPeriodEnd && (
                <div className="text-xs text-muted-foreground">
                  {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on {ukDate(sub.currentPeriodEnd)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warn" /> Upcoming compliance
              </CardTitle>
              <CardDescription>Gas safety & EICR expiries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No expiries on record.</p>}
              {upcoming.map((u) => (
                <div key={u.property.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground">{u.property.address.line1}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{ukDate(u.next)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Building2; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
            <div className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
            {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className="rounded-lg bg-accent text-accent-foreground p-2">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    let: "bg-success/15 text-success border-success/30",
    vacant: "bg-warn/20 text-warn-foreground border-warn/40",
    maintenance: "bg-destructive/15 text-destructive border-destructive/30",
    marketing: "bg-sky/15 text-sky border-sky/30",
  };
  return (
    <Badge variant="outline" className={`mt-1 text-[10px] capitalize ${styles[status] ?? ""}`}>
      {status}
    </Badge>
  );
}
