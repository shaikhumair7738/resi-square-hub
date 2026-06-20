import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProto } from "@/lib/proto-store";
import { gbp } from "@/lib/format";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/app/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const { invoices, properties, payments, activeWorkspace, tickets } = useProto();
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id);
  const wsInv = invoices.filter((i) => wsProps.some((p) => p.id === i.propertyId));
  const wsTickets = tickets.filter((t) => wsProps.some((p) => p.id === t.propertyId));

  const billed = wsInv.reduce((s, i) => s + i.amount, 0);
  const collected = wsInv.reduce((s, i) => s + i.paid, 0);
  const outstanding = billed - collected;
  const collectionRate = billed > 0 ? Math.round((collected / billed) * 100) : 0;

  const byProperty = wsProps.map((p) => {
    const inv = wsInv.filter((i) => i.propertyId === p.id);
    return {
      name: p.address.line1.split(",")[0].slice(0, 14),
      collected: inv.reduce((s, i) => s + i.paid, 0),
      outstanding: inv.reduce((s, i) => s + (i.amount - i.paid), 0),
    };
  });

  const config: ChartConfig = {
    collected: { label: "Collected", color: "var(--teal)" },
    outstanding: { label: "Outstanding", color: "var(--warn)" },
  };

  return (
    <AppShell title="Reports" description="Rent collection, arrears and operational metrics.">
      <div className="grid gap-4 sm:grid-cols-4 mb-4">
        <Stat label="Billed (period)" value={gbp(billed, { showPence: false })} />
        <Stat label="Collected" value={gbp(collected, { showPence: false })} />
        <Stat label="Outstanding" value={gbp(outstanding, { showPence: false })} tone="warn" />
        <Stat label="Collection rate" value={`${collectionRate}%`} tone={collectionRate > 90 ? "good" : "warn"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Rent by property</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-64 w-full">
              <BarChart data={byProperty}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="collected" stackId="a" fill="var(--teal)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="outstanding" stackId="a" fill="var(--warn)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Operations summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Active properties" value={`${wsProps.filter((p) => !p.archived).length}`} />
            <Row label="Vacant" value={`${wsProps.filter((p) => p.status === "vacant").length}`} />
            <Row label="Marketing" value={`${wsProps.filter((p) => p.status === "marketing").length}`} />
            <Row label="Open maintenance tickets" value={`${wsTickets.filter((t) => !["completed", "cancelled"].includes(t.status)).length}`} />
            <Row label="Recent payments" value={`${payments.filter((pm) => wsInv.some((i) => i.id === pm.invoiceId)).length}`} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  const c = tone === "warn" ? "text-warn-foreground" : tone === "good" ? "text-success" : "";
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div><div className={`mt-1.5 text-2xl font-semibold ${c}`}>{value}</div></CardContent></Card>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b last:border-0 pb-2 last:pb-0"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
