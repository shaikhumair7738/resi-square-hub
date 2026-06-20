import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProto } from "@/lib/proto-store";
import { ukDate } from "@/lib/format";
import { FileText, Upload, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/documents/")({
  component: DocumentsPage,
});

const TYPE_LABEL: Record<string, string> = {
  tenancy_agreement: "Tenancy agreement",
  gas_safety: "Gas safety",
  eicr: "EICR",
  epc: "EPC",
  inventory: "Inventory",
  invoice: "Invoice",
  other: "Other",
};

function DocumentsPage() {
  const { documents, activeWorkspace, properties } = useProto();
  const docs = documents.filter((d) => d.workspaceId === activeWorkspace.id);
  return (
    <AppShell
      title="Documents"
      description="Tenancy agreements, certificates and inventories."
      actions={<Button size="sm" variant="outline" onClick={() => toast.info("Upload modal would open here (simulated).")}><Upload className="h-4 w-4" /> Upload</Button>}
    >
      <Card><CardContent className="pt-5">
        <div className="space-y-2">
          {docs.map((d) => {
            const p = d.propertyId ? properties.find((x) => x.id === d.propertyId) : undefined;
            return (
              <div key={d.id} className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p && <Link to="/app/properties/$id" params={{ id: p.id }} className="hover:underline">{p.address.line1}</Link>}
                      {p && " · "}{ukDate(d.uploadedAt)} · {(d.sizeKb / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{TYPE_LABEL[d.type]}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Download started (simulated).")}><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
          {docs.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No documents uploaded yet.</div>}
        </div>
      </CardContent></Card>
    </AppShell>
  );
}
