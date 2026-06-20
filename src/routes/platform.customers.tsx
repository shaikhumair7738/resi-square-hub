import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";
import { Search } from "lucide-react";

export const Route = createFileRoute("/platform/customers")({
  component: PlatformCustomersPage,
});

function PlatformCustomersPage() {
  const { platformCustomers } = useProto();
  const [q, setQ] = useState("");
  const filtered = platformCustomers.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Customers" description="All Resisquare workspaces and subscribers.">
      <Card><CardContent className="pt-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Type</TableHead><TableHead>Plan</TableHead><TableHead className="text-right">MRR</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Signed up</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.country}</div></TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">{c.type}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{c.plan} · {c.interval}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{gbp(c.mrr, { showPence: false })}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{ukDate(c.signupDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    trialing: "bg-sky/15 text-sky border-sky/30",
    past_due: "bg-destructive/15 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`capitalize ${map[status]}`}>{status.replace("_", " ")}</Badge>;
}
