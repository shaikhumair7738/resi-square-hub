import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/platform/subscriptions")({
  component: PlatformSubscriptionsPage,
});

function PlatformSubscriptionsPage() {
  const { platformCustomers } = useProto();
  return (
    <AppShell title="Subscriptions" description="Subscription lifecycle for every workspace.">
      <Card><CardContent className="pt-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Workspace</TableHead><TableHead>Plan</TableHead><TableHead>Interval</TableHead><TableHead className="text-right">MRR</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead></TableRow></TableHeader>
          <TableBody>
            {platformCustomers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="capitalize">{c.plan}</TableCell>
                <TableCell className="capitalize">{c.interval}</TableCell>
                <TableCell className="text-right">{gbp(c.mrr, { showPence: false })}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{c.status.replace("_", " ")}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{ukDate(c.signupDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AppShell>
  );
}
