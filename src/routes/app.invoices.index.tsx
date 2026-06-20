import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import type { Invoice, Payment } from "@/lib/seed-extra";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/invoices/")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const { invoices, properties, activeWorkspace, recordPayment, payments } = useProto();
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id);
  const wsInv = invoices.filter((i) => wsProps.some((p) => p.id === i.propertyId));

  const summary = useMemo(() => {
    const due = wsInv.filter((i) => i.status === "due" || i.status === "part_paid").reduce((s, i) => s + (i.amount - i.paid), 0);
    const overdue = wsInv.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0);
    const collected = wsInv.reduce((s, i) => s + i.paid, 0);
    return { due, overdue, collected };
  }, [wsInv]);

  return (
    <AppShell title="Rent & invoices" description="Track rent invoices, arrears and payments.">
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <SummaryCard label="Outstanding" value={gbp(summary.due, { showPence: false })} tone="warn" />
        <SummaryCard label="Overdue" value={gbp(summary.overdue, { showPence: false })} tone="destructive" />
        <SummaryCard label="Collected (period)" value={gbp(summary.collected, { showPence: false })} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="hidden sm:table-cell">Period</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right hidden md:table-cell">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wsInv.map((inv) => {
                const p = wsProps.find((x) => x.id === inv.propertyId);
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      {p && <Link to="/app/properties/$id" params={{ id: p.id }} className="font-medium hover:underline">{p.address.line1}</Link>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{ukDate(inv.periodStart)} → {ukDate(inv.periodEnd)}</TableCell>
                    <TableCell className="text-sm">{ukDate(inv.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">{gbp(inv.amount, { showPence: false })}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{gbp(inv.paid)}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell className="text-right">
                      {inv.status !== "paid" && <RecordPaymentDialog inv={inv} onSubmit={(amt, method, ref) => { recordPayment(inv.id, amt, method, ref); toast.success("Payment recorded"); }} />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {wsInv.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No invoices yet.</div>}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pt-5">
          <h3 className="text-sm font-semibold mb-3">Recent payments</h3>
          <div className="space-y-2">
            {payments.filter((pm) => wsInv.some((i) => i.id === pm.invoiceId)).slice(0, 6).map((pm) => {
              const inv = wsInv.find((i) => i.id === pm.invoiceId);
              const p = inv ? wsProps.find((x) => x.id === inv.propertyId) : undefined;
              return (
                <div key={pm.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                  <div>
                    <div className="font-medium">{p?.address.line1 ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{ukDate(pm.date)} · {pm.method.replace("_", " ")}{pm.reference ? ` · ${pm.reference}` : ""}</div>
                  </div>
                  <div className="font-semibold text-success">{gbp(pm.amount)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const map = {
    paid: "bg-success/15 text-success border-success/30",
    due: "bg-sky/15 text-sky border-sky/30",
    part_paid: "bg-warn/20 text-warn-foreground border-warn/40",
    overdue: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[status]}`}>{status.replace("_", " ")}</Badge>;
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "warn" | "destructive" | "success" }) {
  const colour = tone === "warn" ? "text-warn-foreground" : tone === "destructive" ? "text-destructive" : "text-success";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
        <div className={`mt-1.5 text-2xl font-semibold tracking-tight ${colour}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function RecordPaymentDialog({ inv, onSubmit }: { inv: Invoice; onSubmit: (amt: number, method: Payment["method"], ref?: string) => void }) {
  const [open, setOpen] = useState(false);
  const outstanding = inv.amount - inv.paid;
  const [amt, setAmt] = useState(outstanding);
  const [method, setMethod] = useState<Payment["method"]>("bank_transfer");
  const [ref, setRef] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>Outstanding: {gbp(outstanding)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Amount (£)</Label>
            <Input type="number" step={0.01} min={0} max={outstanding} value={amt} onChange={(e) => setAmt(Number(e.target.value))} />
          </div>
          <div>
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Payment["method"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="standing_order">Standing order</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reference (optional)</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. OB-RENT" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" onClick={() => { onSubmit(amt, method, ref || undefined); setOpen(false); }}>Save payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
