import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import type { Priority } from "@/lib/seed-extra";
import { ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/tenant/maintenance")({
  component: TenantMaintenancePage,
});

function TenantMaintenancePage() {
  const { tickets, tenancies, createTicket } = useProto();
  const myTenancy = tenancies.find((t) => t.tenantContactIds.includes("ct-oliver"));
  const myTickets = tickets.filter((t) => t.propertyId === myTenancy?.propertyId && t.reportedByContactId === "ct-oliver");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  return (
    <AppShell title="Maintenance" description="Report a new issue or track existing ones.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Report an issue</h3>
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              if (!myTenancy) return;
              createTicket({ propertyId: myTenancy.propertyId, title, description: desc, priority, reportedByContactId: "ct-oliver" });
              toast.success("Issue reported — your property manager has been notified.");
              setTitle(""); setDesc(""); setPriority("medium");
            }}>
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Heating not working" /></div>
              <div><Label>Description</Label><Textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} required /></div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-teal hover:bg-teal/90 text-teal-foreground" disabled={!title}>Submit</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">My open tickets</h3>
            <div className="space-y-2">
              {myTickets.map((t) => (
                <div key={t.id} className="border rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{ukDate(t.reportedAt)}</div>
                  </div>
                  <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
                </div>
              ))}
              {myTickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
