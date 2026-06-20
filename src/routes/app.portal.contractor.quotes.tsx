import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/contractor/quotes")({
  component: ContractorQuotesPage,
});

function ContractorQuotesPage() {
  const { quotes, tickets, properties } = useProto();
  const mine = quotes.filter((q) => q.contractorContactId === "ct-lewis");

  return (
    <AppShell title="Quotes" description="Quotes you've submitted.">
      <div className="space-y-2">
        {mine.map((q) => {
          const t = tickets.find((x) => x.id === q.ticketId);
          const p = t ? properties.find((x) => x.id === t.propertyId) : undefined;
          return (
            <Card key={q.id}><CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{t?.title}</h3>
                  <p className="text-sm text-muted-foreground">{p?.address.line1}</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.notes}</p>
                  <p className="text-xs text-muted-foreground">Submitted {ukDate(q.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{gbp(q.amount)}</div>
                  <Badge variant="outline" className="capitalize mt-1">{q.status}</Badge>
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {mine.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No quotes submitted.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
