import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp } from "@/lib/format";

export const Route = createFileRoute("/platform/events")({
  component: PlatformEventsPage,
});

function PlatformEventsPage() {
  const { stripeEvents, platformCustomers } = useProto();
  return (
    <AppShell title="Stripe events" description="Recent webhook events received from Stripe (simulated).">
      <Card><CardContent className="pt-5">
        <ul className="space-y-2">
          {stripeEvents.map((e) => {
            const c = platformCustomers.find((x) => x.workspaceId === e.workspaceId);
            return (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 border rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm">{e.type}</div>
                  <div className="text-xs text-muted-foreground">{c?.name ?? e.workspaceId} · {new Date(e.createdAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}</div>
                </div>
                <div className="flex items-center gap-3">
                  {typeof e.amount === "number" && <span className="text-sm font-medium">{gbp(e.amount)}</span>}
                  <Badge variant="outline" className={e.status === "failed" ? "bg-destructive/15 text-destructive border-destructive/30" : e.status === "succeeded" ? "bg-success/15 text-success border-success/30" : ""}>{e.status}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent></Card>
    </AppShell>
  );
}
