import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/platform/")({
  component: PlatformOverviewPage,
});

function PlatformOverviewPage() {
  const { platformCustomers, stripeEvents } = useProto();
  const active = platformCustomers.filter((c) => c.status === "active");
  const trialing = platformCustomers.filter((c) => c.status === "trialing");
  const pastDue = platformCustomers.filter((c) => c.status === "past_due");
  const cancelled = platformCustomers.filter((c) => c.status === "cancelled");
  const mrr = active.concat(trialing).reduce((s, c) => s + c.mrr, 0);

  const trend = [
    { m: "Jan", mrr: 1810 }, { m: "Feb", mrr: 1980 }, { m: "Mar", mrr: 2120 },
    { m: "Apr", mrr: 2280 }, { m: "May", mrr: 2410 }, { m: "Jun", mrr: mrr },
  ];
  const config: ChartConfig = { mrr: { label: "MRR (GBP)", color: "var(--teal)" } };

  return (
    <AppShell title="Platform overview" description="KPIs across all Resisquare customers.">
      <div className="grid gap-4 sm:grid-cols-4 mb-4">
        <Stat label="MRR" value={gbp(mrr, { showPence: false })} hint={`${active.length + trialing.length} paying`} />
        <Stat label="Active" value={`${active.length}`} hint="Subscriptions" />
        <Stat label="Trialing" value={`${trialing.length}`} hint="Free trial" />
        <Stat label="At risk" value={`${pastDue.length}`} hint={`${cancelled.length} cancelled`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">MRR trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-64 w-full">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="mrr" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Latest Stripe events</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stripeEvents.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-2 border-b last:border-0 pb-2 last:pb-0">
                <div className="min-w-0">
                  <div className="font-mono text-xs truncate">{e.type}</div>
                  <div className="text-[11px] text-muted-foreground">{ukDate(e.createdAt)}</div>
                </div>
                <Badge variant="outline" className={e.status === "failed" ? "bg-destructive/15 text-destructive border-destructive/30" : e.status === "succeeded" ? "bg-success/15 text-success border-success/30" : ""}>{e.status}</Badge>
              </div>
            ))}
            <Link to="/platform/events" className="text-xs underline block pt-1">View all events</Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card><CardContent className="pt-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </CardContent></Card>
  );
}
