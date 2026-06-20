import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/tenant/payments")({
  component: TenantPaymentsPage,
});

function TenantPaymentsPage() {
  const { invoices, payments, tenancies } = useProto();
  const myTenancy = tenancies.find((t) => t.tenantContactIds.includes("ct-oliver"));
  const myInv = invoices.filter((i) => i.tenancyId === myTenancy?.id);

  return (
    <AppShell title="Rent & payments" description="Your rent statement.">
      <Card><CardContent className="pt-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {myInv.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="text-sm">{ukDate(i.periodStart)} → {ukDate(i.periodEnd)}</TableCell>
                <TableCell className="text-sm">{ukDate(i.dueDate)}</TableCell>
                <TableCell className="text-right">{gbp(i.amount)}</TableCell>
                <TableCell className="text-right">{gbp(i.paid)}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{i.status.replace("_", " ")}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Card className="mt-4"><CardContent className="pt-5">
        <h3 className="font-semibold mb-2 text-sm">Recent payments</h3>
        <ul className="space-y-1 text-sm">
          {payments.filter((p) => myInv.some((i) => i.id === p.invoiceId)).map((p) => (
            <li key={p.id} className="flex justify-between border-b last:border-0 py-2"><span>{ukDate(p.date)} · {p.method.replace("_", " ")}</span><span className="font-medium text-success">{gbp(p.amount)}</span></li>
          ))}
        </ul>
      </CardContent></Card>
    </AppShell>
  );
}
