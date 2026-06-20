import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/owner/statements")({
  component: OwnerStatementsPage,
});

function OwnerStatementsPage() {
  const { properties, invoices, payments } = useProto();
  const mine = properties.filter((p) => p.ownerContactId === "ct-margaret");
  const myInv = invoices.filter((i) => mine.some((p) => p.id === i.propertyId));
  const totalCollected = myInv.reduce((s, i) => s + i.paid, 0);
  const fee = totalCollected * 0.1; // 10% management fee placeholder
  const payout = totalCollected - fee;

  return (
    <AppShell title="Statements" description="Owner payouts and rent collected.">
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <Stat label="Rent collected" value={gbp(totalCollected, { showPence: false })} />
        <Stat label="Management fee (10%)" value={gbp(fee)} />
        <Stat label="Net payout" value={gbp(payout)} />
      </div>
      <Card><CardContent className="pt-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Property</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            {payments.filter((p) => myInv.some((i) => i.id === p.invoiceId)).map((p) => {
              const inv = myInv.find((i) => i.id === p.invoiceId);
              const prop = inv ? mine.find((x) => x.id === inv.propertyId) : undefined;
              return <TableRow key={p.id}><TableCell>{ukDate(p.date)}</TableCell><TableCell>{prop?.address.line1}</TableCell><TableCell className="text-right font-medium">{gbp(p.amount)}</TableCell></TableRow>;
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="pt-5"><div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div><div className="mt-1.5 text-2xl font-semibold">{value}</div></CardContent></Card>;
}
