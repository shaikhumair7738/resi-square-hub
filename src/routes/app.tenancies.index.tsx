import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/tenancies/")({
  component: TenanciesPage,
});

function TenanciesPage() {
  const { tenancies, properties, contacts, activeWorkspace } = useProto();
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id);
  const wsTen = tenancies.filter((t) => wsProps.some((p) => p.id === t.propertyId));

  const today = new Date();
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);

  return (
    <AppShell title="Tenancies" description="Active, on-notice and ended tenancies across your portfolio.">
      <Card>
        <CardContent className="pt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenants</TableHead>
                <TableHead className="hidden md:table-cell">Period</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Rent pcm</TableHead>
                <TableHead className="text-right hidden md:table-cell">Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Days to end</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wsTen.map((t) => {
                const p = wsProps.find((x) => x.id === t.propertyId);
                const tens = contacts.filter((c) => t.tenantContactIds.includes(c.id));
                const d = daysUntil(t.endDate);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      {p ? (
                        <Link to="/app/properties/$id" params={{ id: p.id }} className="hover:underline">
                          <div className="font-medium">{p.address.line1}</div>
                          <div className="text-xs text-muted-foreground">{p.address.postcode}</div>
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{tens.map((c) => c.name).join(", ")}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {ukDate(t.startDate)} → {ukDate(t.endDate)}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium">{gbp(t.rentPcm, { showPence: false })}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{gbp(t.depositGbp)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        t.status === "active" ? "bg-success/15 text-success border-success/30" :
                        t.status === "notice" ? "bg-warn/20 text-warn-foreground border-warn/40" :
                        t.status === "pending" ? "bg-sky/15 text-sky border-sky/30" :
                        ""
                      }>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{d > 0 ? `${d}d` : `${-d}d ago`}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {wsTen.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No tenancies in this workspace.</div>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
