import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import type { MaintenanceTicket, Priority, TicketStatus } from "@/lib/seed-extra";
import { ukDate } from "@/lib/format";
import { Plus, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/app/maintenance/")({
  component: MaintenancePage,
});

const STATUS_COLOURS: Record<TicketStatus, string> = {
  open: "bg-sky/15 text-sky border-sky/30",
  quoting: "bg-warn/20 text-warn-foreground border-warn/40",
  scheduled: "bg-accent text-accent-foreground border-accent",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground",
};

const PRIO_COLOURS: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-sky/15 text-sky border-sky/30",
  high: "bg-warn/20 text-warn-foreground border-warn/40",
  emergency: "bg-destructive/15 text-destructive border-destructive/30",
};

function MaintenancePage() {
  const { tickets, properties, contacts, activeWorkspace, createTicket } = useProto();
  const navigate = useNavigate();
  const wsProps = properties.filter((p) => p.workspaceId === activeWorkspace.id);
  const wsTickets = tickets.filter((t) => wsProps.some((p) => p.id === t.propertyId));
  const [tab, setTab] = useState<string>("open");

  const groups: Record<string, MaintenanceTicket[]> = {
    open: wsTickets.filter((t) => ["open", "quoting"].includes(t.status)),
    scheduled: wsTickets.filter((t) => ["scheduled", "in_progress"].includes(t.status)),
    closed: wsTickets.filter((t) => ["completed", "cancelled"].includes(t.status)),
  };

  return (
    <AppShell
      title="Maintenance"
      description="Tickets, quotes and work orders across your properties."
      actions={<NewTicketDialog wsProps={wsProps} contacts={contacts.filter((c) => c.workspaceId === activeWorkspace.id)} onCreate={(t) => { const c = createTicket(t); toast.success("Ticket created"); navigate({ to: "/app/maintenance/$id", params: { id: c.id } }); }} />}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="open">Open <Badge variant="secondary" className="ml-2">{groups.open.length}</Badge></TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled <Badge variant="secondary" className="ml-2">{groups.scheduled.length}</Badge></TabsTrigger>
          <TabsTrigger value="closed">Closed <Badge variant="secondary" className="ml-2">{groups.closed.length}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 space-y-2">
        {groups[tab].map((t) => {
          const p = wsProps.find((x) => x.id === t.propertyId);
          return (
            <Link key={t.id} to="/app/maintenance/$id" params={{ id: t.id }} className="flex items-center justify-between gap-3 border bg-card rounded-xl px-4 py-3 hover:bg-secondary/40 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {t.priority === "emergency" && <AlertOctagon className="h-4 w-4 text-destructive" />}
                  <span className="font-medium truncate">{t.title}</span>
                  <Badge variant="outline" className={`capitalize ${PRIO_COLOURS[t.priority]}`}>{t.priority}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {p?.address.line1} · Reported {ukDate(t.reportedAt)}
                </div>
              </div>
              <Badge variant="outline" className={`capitalize shrink-0 ${STATUS_COLOURS[t.status]}`}>{t.status.replace("_", " ")}</Badge>
            </Link>
          );
        })}
        {groups[tab].length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No tickets in this group.</div>}
      </div>
    </AppShell>
  );
}

function NewTicketDialog({ wsProps, contacts, onCreate }: { wsProps: ReturnType<typeof useProto>["properties"]; contacts: ReturnType<typeof useProto>["contacts"]; onCreate: (t: Omit<MaintenanceTicket, "id" | "reportedAt" | "status">) => void }) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(wsProps[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const tenants = contacts.filter((c) => c.kind === "tenant");
  const [reportedBy, setReportedBy] = useState<string>("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground"><Plus className="h-4 w-4" /> New ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New maintenance ticket</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{wsProps.map((p) => <SelectItem key={p.id} value={p.id}>{p.address.line1}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking radiator" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <Label>Reported by (optional)</Label>
              <Select value={reportedBy} onValueChange={setReportedBy}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{tenants.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" disabled={!title || !propertyId} onClick={() => { onCreate({ propertyId, title, description, priority, reportedByContactId: reportedBy || undefined }); setOpen(false); }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
