import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProto } from "@/lib/proto-store";
import { planPropertyLimit } from "@/lib/seed";
import { gbp, ukDate } from "@/lib/format";
import {
  Building2, ArrowUpRight, PoundSterling, Wrench, AlertTriangle,
  CalendarClock, Plus, Home, ClipboardList, FileText,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: DashboardDispatcher,
});

function DashboardDispatcher() {
  const { activeRole } = useProto();
  if (activeRole.id === "super_admin") return <Navigate to="/platform" />;
  if (activeRole.id === "tenant") return <TenantDashboard />;
  if (activeRole.id === "contractor") return <ContractorDashboard />;
  if (activeRole.id === "owner_portal") return <OwnerDashboard />;
  return <WorkspaceDashboard />;
}

function WorkspaceDashboard() {
  const { activeRole, activeWorkspace, properties, subscriptions, tenancies, tickets, invoices } = useProto();
  const sub = subscriptions[activeWorkspace.id];
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id && !p.archived);
  const limit = planPropertyLimit(sub?.planId);
  const letCount = wsProps.filter((p) => p.status === "let").length;
  const vacantCount = wsProps.filter((p) => p.status === "vacant").length;
  const monthlyRent = wsProps.reduce((sum, p) => (p.status === "let" ? sum + p.rentPcm : sum), 0);
  const wsTenancies = tenancies.filter((t) => wsProps.some((p) => p.id === t.propertyId));
  const noticeCount = wsTenancies.filter((t) => t.status === "notice").length;
  const wsTickets = tickets.filter((t) => wsProps.some((p) => p.id === t.propertyId));
  const openTickets = wsTickets.filter((t) => !["completed", "cancelled"].includes(t.status));
  const wsInv = invoices.filter((i) => wsProps.some((p) => p.id === i.propertyId));
  const overdue = wsInv.filter((i) => i.status === "overdue").length;

  const upcoming = wsProps
    .filter((p) => p.gasSafetyExpiry || p.eicrExpiry)
    .map((p) => ({ property: p, next: [p.gasSafetyExpiry, p.eicrExpiry].filter(Boolean).sort()[0] as string }))
    .sort((a, b) => a.next.localeCompare(b.next))
    .slice(0, 4);

  const isAgency = activeWorkspace.type === "agency";
  const greeting = activeRole.label.split("·")[1]?.trim() ?? activeRole.label;

  return (
    <AppShell
      title={`Welcome back, ${greeting}`}
      description={isAgency ? "Live snapshot across your branches, properties and tenancies." : "Overview of your portfolio."}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/app/properties">View properties</Link></Button>
          <Button asChild size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground"><Link to="/app/properties/new"><Plus className="h-4 w-4" /> Add property</Link></Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Properties" value={`${wsProps.length}`} hint={`${letCount} let · ${vacantCount} vacant`} />
        <StatCard icon={PoundSterling} label="Monthly rent roll" value={gbp(monthlyRent, { showPence: false })} hint="Active tenancies" />
        <StatCard icon={CalendarClock} label="On notice" value={`${noticeCount}`} hint="Tenancies ending soon" />
        <StatCard icon={Wrench} label="Open tickets" value={`${openTickets.length}`} hint={`${overdue} overdue invoice${overdue === 1 ? "" : "s"}`} tone={overdue > 0 ? "warn" : undefined} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Recent properties</CardTitle><CardDescription>Most recently created in this workspace</CardDescription></div>
            <Button asChild variant="ghost" size="sm"><Link to="/app/properties">All <ArrowUpRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsProps.slice(0, 5).map((p) => (
              <Link key={p.id} to="/app/properties/$id" params={{ id: p.id }} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{p.address.line1}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.address.city} · {p.address.postcode} · {p.bedrooms} bed {p.type}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-semibold text-foreground">{gbp(p.rentPcm, { showPence: false })}<span className="text-xs text-muted-foreground font-normal"> pcm</span></div>
                  <Badge variant="outline" className="mt-1 text-[10px] capitalize">{p.status}</Badge>
                </div>
              </Link>
            ))}
            {wsProps.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No properties yet.</div>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Plan usage</CardTitle><CardDescription>{sub ? <>{sub.planId === "agent" ? "Estate Agent" : "Landlord"} plan · {sub.status === "trialing" ? "Trial" : sub.status}</> : "No subscription"}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Properties</span><span className="font-medium">{wsProps.length} / {limit}</span></div>
                <Progress value={(wsProps.length / limit) * 100} className="mt-1.5 h-2" />
              </div>
              {sub?.currentPeriodEnd && <div className="text-xs text-muted-foreground">{sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on {ukDate(sub.currentPeriodEnd)}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warn" /> Upcoming compliance</CardTitle></CardHeader>
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

function TenantDashboard() {
  const { tenancies, properties, invoices, tickets } = useProto();
  const myTenancy = tenancies.find((t) => t.tenantContactIds.includes("ct-oliver"));
  const myProperty = myTenancy ? properties.find((p) => p.id === myTenancy.propertyId) : undefined;
  const myInv = invoices.filter((i) => i.tenancyId === myTenancy?.id);
  const outstanding = myInv.reduce((s, i) => s + (i.amount - i.paid), 0);
  const myTickets = tickets.filter((t) => t.reportedByContactId === "ct-oliver" && !["completed", "cancelled"].includes(t.status));

  return (
    <AppShell title="Welcome back, Oliver" description="Your tenancy at a glance.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Home} label="Property" value={myProperty?.address.line1.slice(0, 18) ?? "—"} hint={myProperty ? `${myProperty.address.city} · ${myProperty.address.postcode}` : ""} />
        <StatCard icon={PoundSterling} label="Outstanding rent" value={gbp(outstanding, { showPence: false })} hint={outstanding > 0 ? "Please pay your landlord" : "All settled"} tone={outstanding > 0 ? "warn" : undefined} />
        <StatCard icon={Wrench} label="Open requests" value={`${myTickets.length}`} hint="Maintenance" />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to="/app/portal/tenant/tenancy">View tenancy</Link></Button>
        <Button asChild variant="outline"><Link to="/app/portal/tenant/payments">Rent statement</Link></Button>
        <Button asChild className="bg-teal hover:bg-teal/90 text-teal-foreground"><Link to="/app/portal/tenant/maintenance">Report an issue</Link></Button>
      </CardContent></Card>
    </AppShell>
  );
}

function ContractorDashboard() {
  const { workOrders, quotes } = useProto();
  const mineWO = workOrders.filter((w) => w.contractorContactId === "ct-lewis");
  const upcoming = mineWO.filter((w) => w.status !== "completed").length;
  const myQuotes = quotes.filter((q) => q.contractorContactId === "ct-lewis" && q.status === "pending").length;
  return (
    <AppShell title="Welcome back, Lewis" description="Your job board.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Upcoming jobs" value={`${upcoming}`} hint="Scheduled / in progress" />
        <StatCard icon={FileText} label="Pending quotes" value={`${myQuotes}`} hint="Awaiting acceptance" />
        <StatCard icon={Wrench} label="Completed (period)" value={`${mineWO.filter((w) => w.status === "completed").length}`} />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">Get started</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
        <Button asChild className="bg-teal hover:bg-teal/90 text-teal-foreground"><Link to="/app/portal/contractor/work-orders">View work orders</Link></Button>
        <Button asChild variant="outline"><Link to="/app/portal/contractor/quotes">My quotes</Link></Button>
      </CardContent></Card>
    </AppShell>
  );
}

function OwnerDashboard() {
  const { properties, invoices } = useProto();
  const mine = properties.filter((p) => p.ownerContactId === "ct-margaret");
  const myInv = invoices.filter((i) => mine.some((p) => p.id === i.propertyId));
  const collected = myInv.reduce((s, i) => s + i.paid, 0);
  return (
    <AppShell title="Welcome back, Margaret" description="Your portfolio under Northstar Lettings.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Properties" value={`${mine.length}`} hint={`${mine.filter((p) => p.status === "let").length} let`} />
        <StatCard icon={PoundSterling} label="Rent collected (period)" value={gbp(collected, { showPence: false })} />
        <StatCard icon={CalendarClock} label="Next statement" value={ukDate(new Date(Date.now() + 7 * 86400000))} />
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">Quick links</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to="/app/portal/owner/portfolio">My portfolio</Link></Button>
        <Button asChild className="bg-teal hover:bg-teal/90 text-teal-foreground"><Link to="/app/portal/owner/statements">View statements</Link></Button>
      </CardContent></Card>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: typeof Building2; label: string; value: string; hint?: string; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
            <div className={`mt-1.5 text-2xl font-semibold tracking-tight ${tone === "warn" ? "text-warn-foreground" : "text-foreground"}`}>{value}</div>
            {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className="rounded-lg bg-accent text-accent-foreground p-2"><Icon className="h-4 w-4" /></div>
        </div>
      </CardContent>
    </Card>
  );
}
