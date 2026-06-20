import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { Briefcase, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/app/branches/")({
  component: BranchesPage,
});

function BranchesPage() {
  const { branches, properties, staffList, activeWorkspace } = useProto();
  const wsBranches = branches.filter((b) => b.workspaceId === activeWorkspace.id);

  return (
    <AppShell title="Branches" description="Manage office locations for your agency.">
      <div className="grid gap-4 md:grid-cols-2">
        {wsBranches.map((b) => {
          const props = properties.filter((p) => p.branchId === b.id && !p.archived);
          const stf = staffList.filter((s) => s.branchId === b.id);
          return (
            <Card key={b.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5 text-teal" /> {b.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {b.address.line1}, {b.address.city} {b.address.postcode}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> {b.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-sm border-t pt-3">
                  <Badge variant="outline">{props.length} propert{props.length === 1 ? "y" : "ies"}</Badge>
                  <Badge variant="outline">{stf.length} staff</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {wsBranches.length === 0 && <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No branches in this workspace.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
