import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import { planPropertyLimit, type Property } from "@/lib/seed";
import { gbp } from "@/lib/format";
import { Plus, Search, Building2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/properties/")({
  component: PropertiesListPage,
});

function PropertiesListPage() {
  const navigate = useNavigate();
  const { properties, activeWorkspace, subscriptions, activeRole } = useProto();
  const sub = subscriptions[activeWorkspace.id];
  const limit = planPropertyLimit(sub?.planId);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const all = useMemo(
    () => properties.filter((p) => p.workspaceId === activeWorkspace.id),
    [properties, activeWorkspace.id],
  );

  const filtered = useMemo(() => {
    return all
      .filter((p) => (showArchived ? p.archived : !p.archived))
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .filter((p) => {
        if (!q.trim()) return true;
        const needle = q.toLowerCase();
        return (
          p.reference.toLowerCase().includes(needle) ||
          p.address.line1.toLowerCase().includes(needle) ||
          p.address.city.toLowerCase().includes(needle) ||
          p.address.postcode.toLowerCase().includes(needle)
        );
      });
  }, [all, q, statusFilter, showArchived]);

  const activeCount = all.filter((p) => !p.archived).length;
  const atLimit = activeCount >= limit;
  const canCreate = activeRole.id === "agent_admin" || activeRole.id === "landlord_owner" || activeRole.id === "branch_manager" || activeRole.id === "property_manager";

  return (
    <AppShell
      title="Properties"
      description={`Manage the portfolio for ${activeWorkspace.name}.`}
      actions={
        canCreate && (
          <Button
            size="sm"
            className="bg-teal hover:bg-teal/90 text-teal-foreground"
            disabled={atLimit}
            onClick={() => navigate({ to: "/app/properties/new" })}
            title={atLimit ? "Property limit reached — upgrade your plan to add more" : undefined}
          >
            <Plus className="h-4 w-4" /> Add property
          </Button>
        )
      }
    >
      {atLimit && (
        <Alert className="mb-4 border-warn/40 bg-warn/10">
          <AlertTriangle className="h-4 w-4 text-warn-foreground" />
          <AlertTitle>Plan limit reached</AlertTitle>
          <AlertDescription>
            You're using {activeCount} of {limit} properties on the {sub?.planId === "agent" ? "Estate Agent" : "Landlord"} plan.
            Upgrade or add the extra-properties add-on to keep growing.{" "}
            <Link to="/pricing" className="underline font-medium">View plans</Link>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search by ref, address or postcode" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="let">Let</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={showArchived ? "default" : "outline"} size="sm" onClick={() => setShowArchived((s) => !s)}>
              {showArchived ? "Showing archived" : "Active only"}
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">
              {activeCount} / {limit} used
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Beds</TableHead>
                  <TableHead className="text-right">Rent pcm</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate({ to: "/app/properties/$id", params: { id: p.id } })}
                  >
                    <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.address.line1}</div>
                      <div className="text-xs text-muted-foreground">{p.address.city} · {p.address.postcode}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{p.type}</TableCell>
                    <TableCell className="hidden sm:table-cell">{p.bedrooms}</TableCell>
                    <TableCell className="text-right font-medium">{gbp(p.rentPcm, { showPence: false })}</TableCell>
                    <TableCell><RowStatus p={p} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 text-sm text-muted-foreground">No properties match your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function RowStatus({ p }: { p: Property }) {
  const map: Record<string, string> = {
    let: "bg-success/15 text-success border-success/30",
    vacant: "bg-warn/20 text-warn-foreground border-warn/40",
    maintenance: "bg-destructive/15 text-destructive border-destructive/30",
    marketing: "bg-sky/15 text-sky border-sky/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[p.status] ?? ""}`}>{p.status}</Badge>;
}
