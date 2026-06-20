import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/contractor/work-orders")({
  component: ContractorWorkOrdersPage,
});

function ContractorWorkOrdersPage() {
  const { workOrders, tickets, properties, quotes, markWorkOrderComplete, setTicketStatus } = useProto();
  // Demo binding: Lewis Grant (ct-lewis)
  const mine = workOrders.filter((w) => w.contractorContactId === "ct-lewis");

  return (
    <AppShell title="Work orders" description="Jobs assigned to you.">
      <div className="space-y-2">
        {mine.map((w) => {
          const t = tickets.find((x) => x.id === w.ticketId);
          const p = t ? properties.find((x) => x.id === t.propertyId) : undefined;
          const q = quotes.find((x) => x.id === w.quoteId);
          return (
            <Card key={w.id}><CardContent className="pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{t?.title}</h3>
                  <p className="text-sm text-muted-foreground">{p?.address.line1}, {p?.address.city} {p?.address.postcode}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled: {ukDate(w.scheduledFor)} · Quote: {q ? gbp(q.amount) : "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="capitalize">{w.status.replace("_", " ")}</Badge>
                  {w.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => { setTicketStatus(w.ticketId, "in_progress"); toast.success("Marked started"); }}>Start job</Button>}
                  {w.status !== "completed" && <Button size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground" onClick={() => { markWorkOrderComplete(w.id); toast.success("Marked complete"); }}>Mark complete</Button>}
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {mine.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No work orders.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
